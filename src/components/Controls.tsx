import { useVisualizationStore } from '../store/visualizationStore'

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
  previewSize: number
  defaultPreviewSize: number
  onPreviewSizeChange: (size: number) => void
  onResetPreviewSize: () => void
  showDisplaySettings: boolean
  onToggleDisplaySettings: () => void
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
  previewSize,
  defaultPreviewSize,
  onPreviewSizeChange,
  onResetPreviewSize,
  showDisplaySettings,
  onToggleDisplaySettings,
}: ControlsProps) {
  const theme = useVisualizationStore((s) => s.theme)
  const toggleTheme = useVisualizationStore((s) => s.toggleTheme)

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1 md:gap-2">
        <IconButton label="Zoom in" onClick={onZoomIn} icon="＋" />
        <IconButton label="Zoom out" onClick={onZoomOut} icon="－" />
        <IconButton label="Reset view" onClick={onReset} icon="⟳" />
        <IconButton
          label="Toggle legend"
          onClick={onToggleLegend}
          icon={legendVisible ? '☰' : '☷'}
        />
        <IconButton
          label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          onClick={toggleTheme}
          icon={theme === 'light' ? '🌙' : '☀️'}
        />
        <button
          type="button"
          onClick={onToggleDisplaySettings}
          className="relative rounded-md bg-white/80 px-2 py-2 text-xs font-medium text-slate-600 shadow hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Display settings"
          aria-expanded={showDisplaySettings}
          aria-label="Toggle display settings panel"
        >
          <span className="hidden md:inline">Display</span>
          <span className="md:hidden">⚙</span>
          <span className={`ml-1 inline-block transition-transform ${showDisplaySettings ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>
      </div>

      {showDisplaySettings && (
        <div className="absolute left-0 top-full mt-1 flex flex-col gap-3 rounded-md bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-lg dark:bg-slate-800/95 dark:text-slate-100 sm:flex-row sm:gap-4 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <label htmlFor="point-size" className="whitespace-nowrap font-medium text-slate-600 dark:text-slate-200">
              Points
            </label>
            <input
              id="point-size"
              type="range"
              min={4}
              max={40}
              step={1}
              value={pointSize}
              onChange={(event) => onPointSizeChange(Number(event.target.value))}
              className="w-20 accent-cyan-500 dark:accent-cyan-400 sm:w-24"
              aria-label="Adjust point size"
            />
            <span className="w-5 text-center">{pointSize}</span>
            <ResetButton onClick={onResetPointSize} label={`Default ${defaultPointSize}`} />
          </div>
          <div className="flex items-center gap-2 border-l-0 border-t border-slate-300 pt-2 dark:border-slate-600 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
            <label htmlFor="preview-size" className="whitespace-nowrap font-medium text-slate-600 dark:text-slate-200">
              Preview
            </label>
            <input
              id="preview-size"
              type="range"
              min={64}
              max={400}
              step={4}
              value={previewSize}
              onChange={(event) => onPreviewSizeChange(Number(event.target.value))}
              className="w-20 accent-cyan-500 dark:accent-cyan-400 sm:w-24"
              aria-label="Adjust preview image size"
            />
            <span className="w-7 text-center">{previewSize}</span>
            <ResetButton onClick={onResetPreviewSize} label={`Default ${defaultPreviewSize}`} />
          </div>
        </div>
      )}
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
      className="rounded-md bg-white/80 px-4 py-3 text-base text-slate-700 shadow hover:bg-slate-100 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-700 md:px-3 md:py-2 md:text-sm"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <span className="md:text-base">{icon}</span>
    </button>
  )
}

function ResetButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <button
      className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      ↺
    </button>
  )
}
