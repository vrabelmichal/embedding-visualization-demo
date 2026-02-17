interface ControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onToggleLegend: () => void
  legendVisible: boolean
}

export function Controls({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleLegend,
  legendVisible,
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
