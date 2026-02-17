import { useState } from 'react'
import { EmbeddingViewer } from './components/EmbeddingViewer'

function App() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center gap-2 px-3 py-2 text-sm md:px-4">
        <h1 className="text-base font-semibold text-white">Astronomical Embedding Explorer</h1>
        <button
          className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700"
          onClick={() => setShowInfo((v) => !v)}
          aria-label="Toggle info"
        >
          i
        </button>
        {showInfo && (
          <p className="text-xs text-slate-300">
            Hover: image. Click/tap: details. Use controls to zoom/reset/legend.
          </p>
        )}
      </header>
      <EmbeddingViewer />
    </div>
  )
}

export default App
