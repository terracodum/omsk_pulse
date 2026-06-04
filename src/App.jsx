import { useState, useEffect } from 'react'
import UploadScreen from './screens/UploadScreen'
import ProgressScreen from './screens/ProgressScreen'
import DashboardScreen from './screens/DashboardScreen'
import DrilldownScreen from './screens/DrilldownScreen'

const STORAGE_KEY = 'omsk_pulse_ready'
const THEME_KEY   = 'omsk_pulse_theme'

export default function App() {
  const [screen, setScreen] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1' ? 'dashboard' : 'upload'
  )
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [dark, setDark] = useState(false) // светлая по умолчанию

  // применяем тему через data-theme атрибут — работает без Tailwind dark:
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  // восстанавливаем тему при загрузке
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark') setDark(true)
  }, [])

  const handleStartAnalysis  = () => setScreen('progress')
  const handleAnalysisDone   = () => { localStorage.setItem(STORAGE_KEY, '1'); setScreen('dashboard') }
  const handleDistrictClick  = (d) => { setSelectedDistrict(d); setScreen('drilldown') }
  const handleBack           = () => { setSelectedDistrict(null); setScreen('dashboard') }
  const handleReset          = () => { localStorage.removeItem(STORAGE_KEY); setSelectedDistrict(null); setScreen('upload') }
  const toggleTheme          = () => setDark(d => !d)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {screen === 'upload'    && <UploadScreen onStart={handleStartAnalysis} dark={dark} onToggleTheme={toggleTheme} />}
      {screen === 'progress'  && <ProgressScreen onDone={handleAnalysisDone} />}
      {screen === 'dashboard' && <DashboardScreen onDistrictClick={handleDistrictClick} onReset={handleReset} dark={dark} onToggleTheme={toggleTheme} />}
      {screen === 'drilldown' && selectedDistrict && (
        <DrilldownScreen district={selectedDistrict} onBack={handleBack} dark={dark} onToggleTheme={toggleTheme} />
      )}
    </div>
  )
}
