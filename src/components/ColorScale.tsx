import type { ColorMapping } from '../utils/types'
import { legendColors } from '../utils/colorMapper'

interface ColorScaleProps {
  mapping?: ColorMapping
  min?: number
  max?: number
}

export function ColorScale({ mapping, min, max }: ColorScaleProps) {
  if (!mapping?.column) return null
  const colors = legendColors(mapping)
  const gradient = `linear-gradient(to right, ${colors.join(',')})`

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-200">{mapping.column}</p>
      <div className="h-3 rounded-full" style={{ background: gradient }} />
      <div className="flex justify-between text-[11px] text-slate-400">
        <span>{min ?? 'min'}</span>
        <span>{max ?? 'max'}</span>
      </div>
    </div>
  )
}
