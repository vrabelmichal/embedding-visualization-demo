import { getShapeClipPath } from '../utils/shapeRenderer'
import type { EmbeddingShape } from '../utils/types'

interface ShapeLegendProps {
  shapes: EmbeddingShape[]
  labels?: Partial<Record<EmbeddingShape, string>>
}

export function ShapeLegend({ shapes, labels }: ShapeLegendProps) {
  if (!shapes.length) return null
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">Shapes</p>
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
        {shapes.map((shape) => (
          <div key={shape} className="flex items-center gap-2">
            <span
              className="h-5 w-5 bg-indigo-400"
              style={{ clipPath: getShapeClipPath(shape) }}
            />
            <span className="capitalize">{labels?.[shape] ?? shape}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
