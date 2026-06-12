import { useState, useEffect, useMemo } from 'react'
import { EmbeddingViewer } from './components/EmbeddingViewer'
import { UrlDisplay } from './components/UrlDisplay'
import { useVisualizationStore } from './store/visualizationStore'
import { getDisplayUrls } from './utils/urlResolver'
import type { DisplayUrls } from './utils/urlResolver'

function App() {
  const [showInfo, setShowInfo] = useState(false)
  const theme = useVisualizationStore((s) => s.theme)
  const displayUrls: DisplayUrls | null = useMemo(() => {
    try {
      return getDisplayUrls()
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center gap-3 px-3 py-2 text-sm md:px-4 min-w-0">
        <h1 className="shrink-0 text-base font-semibold text-slate-900 dark:text-white">Embedding Explorer</h1>
        {displayUrls && <UrlDisplay urls={displayUrls} />}
        <button
          className="shrink-0 rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
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
      </header>
      <EmbeddingViewer />
    </div>
  )
}

export default App