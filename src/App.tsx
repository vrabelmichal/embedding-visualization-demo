import { useState, useEffect } from 'react'
import { EmbeddingViewer } from './components/EmbeddingViewer'
import { useVisualizationStore } from './store/visualizationStore'

function App() {
  const [showInfo, setShowInfo] = useState(false)
  const theme = useVisualizationStore((s) => s.theme)
  const toggleTheme = useVisualizationStore((s) => s.toggleTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center gap-2 px-3 py-2 text-sm md:px-4">
        <h1 className="text-base font-semibold text-slate-900 dark:text-white">Astronomical Embedding Explorer</h1>
        <button
          className="rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          onClick={() => setShowInfo((v) => !v)}
          aria-label="Toggle info"
        >
          i
        </button>
        {showInfo && (
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Hover: image. Click/tap: details. Use controls to zoom/reset/legend.
          </p>
        )}
        <div className="ml-auto">
          <button
            onClick={toggleTheme}
            className="rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      <EmbeddingViewer />
    </div>
  )
}

export default App