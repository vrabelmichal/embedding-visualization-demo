interface ControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onToggleLegend: () => void
  legendVisible: boolean
  pointSize: number
  defaultPointSize: number
  onPointSizeChange: (size: number) => void
  onResetPointSize: () => void
}

export function Controls({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleLegend,
  legendVisible,
  pointSize,
  defaultPointSize,
  onPointSizeChange,
  onResetPointSize,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 md:gap-2">
      <IconButton label="Zoom in" onClick={onZoomIn} icon="＋" />
      <IconButton label="Zoom out" onClick={onZoomOut} icon="－" />
      <IconButton label="Reset view" onClick={onReset} icon="⟳" />
      <IconButton
        label="Toggle legend"
        onClick={onToggleLegend}
        icon={legendVisible ? '☰' : '☷'}
      />
      <div className="flex items-center gap-2 rounded-md bg-slate-800/80 px-2 py-1.5 text-xs text-slate-100 shadow">
        <label htmlFor="point-size" className="whitespace-nowrap font-medium text-slate-200">
          Point size
        </label>
        <input
          id="point-size"
          type="range"
          min={4}
          max={40}
          step={1}
          value={pointSize}
          onChange={(event) => onPointSizeChange(Number(event.target.value))}
          className="w-24 accent-cyan-400"
          aria-label="Adjust point size"
        />
        <span className="w-6 text-center text-[11px]">{pointSize}</span>
        <button
          className="rounded bg-slate-700 px-2 py-1 text-[11px] hover:bg-slate-600"
          onClick={onResetPointSize}
          title={`Reset to default (${defaultPointSize})`}
          aria-label={`Reset point size to default ${defaultPointSize}`}
        >
          Default {defaultPointSize}
        </button>
      </div>
    </div>
  )
}

function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="rounded-md bg-slate-800/80 px-4 py-3 text-base text-white shadow hover:bg-slate-700 md:px-3 md:py-2 md:text-sm"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <span className="md:text-base">{icon}</span>
    </button>
  )
}
