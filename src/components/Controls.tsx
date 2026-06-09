import { useVisualizationStore } from '../store/visualizationStore'
import { ZoomInIcon, ZoomOutIcon, ResetViewIcon, LegendIcon, DarkModeIcon, LightModeIcon, DisplayIcon, ChevronDownIcon } from './icons'

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
      <div className="flex items-center gap-1">
        <ToolbarButton label="Zoom in" onClick={onZoomIn}>
          <ZoomInIcon />
        </ToolbarButton>
        <ToolbarButton label="Zoom out" onClick={onZoomOut}>
          <ZoomOutIcon />
        </ToolbarButton>
        <ToolbarButton label="Reset view" onClick={onReset}>
          <ResetViewIcon />
        </ToolbarButton>
        <ToolbarButton label={legendVisible ? 'Hide legend' : 'Show legend'} onClick={onToggleLegend}>
          <LegendIcon />
        </ToolbarButton>
        <ToolbarButton
          label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          onClick={toggleTheme}
        >
          {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </ToolbarButton>
        <ToolbarButton
          label="Display settings"
          onClick={onToggleDisplaySettings}
          aria-expanded={showDisplaySettings}
        >
          <div className="flex items-center gap-1">
            <DisplayIcon />
            <span className="hidden md:inline text-xs font-medium">Display</span>
            <ChevronDownIcon size={12} className={`hidden md:inline transition-transform ${showDisplaySettings ? 'rotate-180' : ''}`} />
          </div>
        </ToolbarButton>
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

function ToolbarButton({
  label,
  onClick,
  children,
  ...rest
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center h-9 min-w-[2.25rem] rounded-md bg-white/80 px-2 text-slate-600 shadow hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
      title={label}
      aria-label={label}
      onClick={onClick}
      {...rest}
    >
      {children}
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
      className="inline-flex items-center rounded bg-slate-200 px-1.5 py-0.5 text-[11px] hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    </button>
  )
}
