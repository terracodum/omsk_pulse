import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import osmtogeojson from 'osmtogeojson'

const CACHE_KEY = 'omsk_boundaries_v3'

// Находим Омскую область как area, затем берём только то что внутри неё
const OVERPASS_QUERY = `[out:json][timeout:90];
relation["boundary"="administrative"]["admin_level"="4"]["name"="Омская область"];
map_to_area->.omsk;
(
  relation["boundary"="administrative"]["admin_level"="6"](area.omsk);
  relation["boundary"="administrative"]["admin_level"="9"](area.omsk);
);
out geom;`

const scoreToColor = (score) => {
  if (score == null) return '#374151'
  if (score >= 75) return '#22c55e'
  if (score >= 60) return '#84cc16'
  if (score >= 50) return '#f97316'
  if (score >= 35) return '#ef4444'
  return '#991b1b'
}

// Мягкое сопоставление: ищем district чьё имя входит в OSM name или наоборот
function matchDistrict(osmName, districts) {
  if (!osmName) return null
  const n = osmName.toLowerCase()
  return districts.find(d => {
    const dn = d.name.toLowerCase()
      .replace(' округ', '').replace(' район', '').replace('ский', '').replace('ской', '')
    return n.includes(dn) || dn.includes(n.replace(' район', '').replace(' округ', ''))
  }) || null
}

export default function OmskMap({ districts, onDistrictClick }) {
  const [geojson, setGeojson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        setGeojson(JSON.parse(cached))
      } catch {
        localStorage.removeItem(CACHE_KEY)
      }
      setLoading(false)
      return
    }

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
    })
      .then(r => r.json())
      .then(data => {
        const gj = osmtogeojson(data)
        localStorage.setItem(CACHE_KEY, JSON.stringify(gj))
        setGeojson(gj)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const styleFeature = (feature) => {
    const district = matchDistrict(feature.properties?.name, districts)
    return {
      fillColor: scoreToColor(district?.score),
      fillOpacity: 0.45,
      color: '#6b7280',
      weight: 1,
      opacity: 0.8,
    }
  }

  const onEachFeature = (feature, layer) => {
    const osmName = feature.properties?.name || ''
    const district = matchDistrict(osmName, districts)
    const label = district
      ? `${district.name} · скор ${district.score}`
      : osmName

    layer.bindTooltip(label, { sticky: true })

    layer.on({
      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.7, weight: 2 }),
      mouseout: (e) => e.target.setStyle({ fillOpacity: 0.45, weight: 1 }),
      click: () => district && onDistrictClick(district),
    })
  }

  return (
    <MapContainer
      center={[55.8, 73.2]}
      zoom={6}
      style={{ height: '100%', width: '100%', background: '#111827' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />

      {geojson && (
        <GeoJSON
          key={geojson.features?.length}
          data={geojson}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      )}

      {/* Точки всегда — как fallback и дополнительный клик */}
      {districts.map((district) => (
        <CircleMarker
          key={district.id}
          center={district.coords}
          radius={loading ? 10 : 5}
          pathOptions={{
            fillColor: scoreToColor(district.score),
            fillOpacity: loading ? 0.85 : 0.6,
            color: '#0f172a',
            weight: 1,
          }}
          eventHandlers={{ click: () => onDistrictClick(district) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            {district.name} · {district.score}
          </Tooltip>
        </CircleMarker>
      ))}

      {loading && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: '#1f2937', color: '#9ca3af',
          padding: '4px 12px', borderRadius: 6, fontSize: 12, border: '1px solid #374151',
        }}>
          Загрузка границ…
        </div>
      )}
    </MapContainer>
  )
}
