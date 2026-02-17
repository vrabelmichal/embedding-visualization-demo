import { ColorScale } from './ColorScale'
import { ShapeLegend } from './ShapeLegend'
import type { ColorMapping, EmbeddingShape } from '../utils/types'

interface LegendProps {
  visible: boolean
  onClose: () => void
  mapping?: ColorMapping
  min?: number
  max?: number
  shapes: EmbeddingShape[]
}

export function Legend({ visible, onClose, mapping, min, max, shapes }: LegendProps) {
  if (!visible) return null

  const showShapes = shapes.length > 1
  const showScale = Boolean(mapping?.column)

  if (!showShapes && !showScale) return null

  return (
    <div className="fixed right-4 top-4 z-30 w-64 max-w-[90vw] rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Legend</p>
        <button
          onClick={onClose}
          className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700"
        >
          Close
        </button>
      </div>
      <div className="space-y-4">
        {showScale && <ColorScale mapping={mapping} min={min} max={max} />}
        {showShapes && <ShapeLegend shapes={shapes} />}
      </div>
    </div>
  )
}
