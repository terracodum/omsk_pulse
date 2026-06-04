import { Zap, TrendingUp, AlertTriangle, RotateCcw } from 'lucide-react'
import { districts } from '../data/mockData'
import OmskMap from '../components/OmskMap'
import Top10Table from '../components/Top10Table'
import DistrictCard from '../components/DistrictCard'
import ThemeToggle from '../components/ThemeToggle'

const card = { background: 'var(--bg-card)', borderColor: 'var(--border)', borderWidth: 1, borderStyle: 'solid' }

export default function DashboardScreen({ onDistrictClick, onReset, dark, onToggleTheme }) {
  const sorted = [...districts].sort((a, b) => b.score - a.score)
  const worst  = [...districts].sort((a, b) => a.score - b.score).slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="px-5 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm"
        style={{ background: 'var(--head-bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight" style={{ color: 'var(--text)' }}>ОмскПульс</span>
          <span className="hidden sm:block text-sm" style={{ color: 'var(--muted)' }}>· Аналитика обращений 2024</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Данные актуальны
          </div>
          <button onClick={onReset}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:block">Новый файл</span>
          </button>
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4 p-4 lg:p-5">
        {/* Map + Table */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Map */}
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col shadow-sm" style={{ ...card, height: '440px' }}>
            <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Карта Омской области</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>кликните на район</span>
            </div>
            {/* Legend */}
            <div className="px-4 py-2 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              {[['#22c55e','75+'],['#84cc16','60–74'],['#f97316','50–59'],['#ef4444','35–49'],['#991b1b','<35']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{l}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 min-h-0">
              <OmskMap districts={districts} onDistrictClick={onDistrictClick} />
            </div>
          </div>

          {/* Top-10 */}
          <div className="w-full lg:w-72 xl:w-80 rounded-2xl overflow-hidden flex flex-col shadow-sm"
            style={{ ...card, height: '440px' }}>
            <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Топ-10 районов</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>по скору</span>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <Top10Table districts={sorted.slice(0, 10)} onDistrictClick={onDistrictClick} />
            </div>
          </div>
        </div>

        {/* Worst-3 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>Критические районы</h2>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>· требуют первоочередного внимания</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {worst.map((d, i) => (
              <DistrictCard key={d.id} district={d} rank={i + 1} onClick={() => onDistrictClick(d)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
