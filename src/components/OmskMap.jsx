import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'

const BOUNDS = L.latLngBounds([[52.5, 68.0], [59.5, 78.0]])
const MIN_ZOOM = 6

function MapConstraints() {
  const map = useMap()
  useEffect(() => {
    map.setMinZoom(MIN_ZOOM)
    map.setMaxBounds(BOUNDS)
    map.options.bounceAtZoomLimits = false
    const clampZoom = () => {
      if (map.getZoom() < MIN_ZOOM) map.setZoom(MIN_ZOOM, { animate: false })
    }
    map.on('zoom', clampZoom)
    map.on('zoomend', clampZoom)
    return () => { map.off('zoom', clampZoom); map.off('zoomend', clampZoom) }
  }, [map])
  return null
}
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
  if (score == null) return '#cbd5e1'
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
      fillOpacity: 0.5,
      color: '#9ca3af',
      weight: 1,
      opacity: 1,
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
      zoomAnimation={true}
      maxBounds={BOUNDS}
      maxBoundsViscosity={3.0}
      bounceAtZoomLimits={false}
      inertia={false}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <MapConstraints />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />

      {geojson && (
        <GeoJSON
          key={geojson.features?.length}
          data={geojson}
          style={styleFeature}
          onEachFeature={onEachFeature}
          pointToLayer={() => null}
        />
      )}


      {loading && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: '#ffffff', color: '#6b7280',
          padding: '4px 12px', borderRadius: 6, fontSize: 12, border: '1px solid #e2e8f0',
        }}>
          Загрузка границ…
        </div>
      )}
    </MapContainer>
  )
}
