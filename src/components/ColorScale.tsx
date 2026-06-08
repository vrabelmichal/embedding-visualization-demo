import type { ColorMapping } from '../utils/types'
import { categoricalLegendItems, legendColors } from '../utils/colorMapper'

interface ColorScaleProps {
  mapping?: ColorMapping
  min?: number
  max?: number
}

export function ColorScale({ mapping, min, max }: ColorScaleProps) {
  if (!mapping) return null

  if (mapping.mode === 'categorical') {
    const items = categoricalLegendItems(mapping)
    if (!items.length) return null

    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{mapping.column ?? 'Category'}</p>
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={`${item.label}-${item.color}`} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="h-3 w-3 rounded-sm border border-slate-300 dark:border-slate-700" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!mapping.column) return null

  const colors = legendColors(mapping)
  const gradient = `linear-gradient(to right, ${colors.join(',')})`

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{mapping.column}</p>
      <div className="h-3 rounded-full" style={{ background: gradient }} />
      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>{min ?? 'min'}</span>
        <span>{max ?? 'max'}</span>
      </div>
    </div>
  )
}
