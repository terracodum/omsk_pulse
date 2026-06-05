import { useEffect, useState } from 'react'
import { CheckCircle2, Database, BrainCircuit, Layers, Tag, FileText, Zap } from 'lucide-react'
import { analysisSteps } from '../data/mockData'

const STEP_ICONS = [Database, BrainCircuit, Layers, Tag, FileText]
const STEP_DURATION = 1400

export default function ProgressScreen({ onDone }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const total = analysisSteps.length * STEP_DURATION
    const iv = setInterval(() => setProgress(p => Math.min(p + 100 / (total / 50), 100)), 50)
    const timers = analysisSteps.map((_, i) => setTimeout(() => setCurrentStep(i + 1), (i + 1) * STEP_DURATION))
    const done = setTimeout(() => { clearInterval(iv); setProgress(100); setTimeout(onDone, 600) }, total + 300)
    return () => { clearInterval(iv); timers.forEach(clearTimeout); clearTimeout(done) }
  }, [onDone])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center gap-2 mb-14">
        <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold" style={{ color: 'var(--text)' }}>ZeroProblems</span>
      </div>

      <div className="w-full max-w-sm anim-up">
        <h2 className="text-xl font-bold text-center mb-1" style={{ color: 'var(--text)' }}>Анализ данных</h2>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--muted)' }}>Обрабатываем обращения граждан…</p>

        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5" style={{ background: 'var(--border)' }} />
          <div className="absolute left-5 top-5 w-0.5 bg-red-500 transition-all duration-700"
            style={{ height: `calc(${(currentStep / analysisSteps.length) * 100}% - 20px)` }} />

          <div className="space-y-5">
            {analysisSteps.map((step, idx) => {
              const Icon = STEP_ICONS[idx]
              const done = idx < currentStep
              const active = idx === currentStep
              return (
                <div key={step.id} className="flex items-start gap-4 relative">
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 ${active ? 'step-pulse' : ''}`}
                    style={{
                      background: done ? '#dc2626' : 'var(--bg-card)',
                      borderColor: done ? '#dc2626' : active ? '#dc2626' : 'var(--border)',
                    }}
                  >
                    {done
                      ? <CheckCircle2 className="w-5 h-5 text-white" />
                      : <Icon className="w-4 h-4" style={{ color: active ? '#dc2626' : 'var(--muted)' }} />
                    }
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm font-semibold transition-colors duration-300"
                      style={{ color: done ? 'var(--muted)' : active ? 'var(--text)' : 'var(--muted)' }}>
                      {step.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: active ? 'var(--text-2)' : 'var(--border)' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--muted)' }}>
            <span>Прогресс</span>
            <span className="font-medium" style={{ color: 'var(--text-2)' }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-sub)' }}>
            <div className="h-full bg-red-600 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
