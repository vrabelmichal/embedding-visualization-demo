import { useMemo, useState } from 'react'
import { ScatterPlot } from './ScatterPlot'
import { ImageTooltip } from './ImageTooltip'
import { DetailPanel } from './DetailPanel'
import { Controls } from './Controls'
import { Legend } from './Legend'
import { LoadingState } from './LoadingState'
import { useDataLoader } from '../hooks/useDataLoader'
import { useViewState } from '../hooks/useViewState'
import { useShapeMapping } from '../hooks/useShapeMapping'
import type { AstronomicalObject, ColorMapping, VisualizationConfig } from '../utils/types'
import { parseVisualizationConfigFile } from '../utils/visualizationConfig'

const DEFAULT_POINT_SIZE = 18
const DEFAULT_PREVIEW_SIZE = 160
const PREVIEW_SIZE_MIN = 64
const PREVIEW_SIZE_MAX = 400

export function EmbeddingViewer() {
  const { data, loading, error, loadFromFile } = useDataLoader()
  const objects = data?.objects ?? []

  const { viewState, onViewStateChange, resetView, zoomIn, zoomOut } =
    useViewState(objects)

  const { uniqueShapes } = useShapeMapping(objects)

  const [hovered, setHovered] = useState<{
    object: AstronomicalObject
    x: number
    y: number
  } | null>(null)
  const [selected, setSelected] = useState<AstronomicalObject | null>(null)
  const [legendVisible, setLegendVisible] = useState(true)
  const [pointSize, setPointSize] = useState(DEFAULT_POINT_SIZE)
  const [previewSize, setPreviewSize] = useState(DEFAULT_PREVIEW_SIZE)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)
  const [config, setConfig] = useState<VisualizationConfig | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [showConfigHelp, setShowConfigHelp] = useState(false)

  const effectiveColorMapping = useMemo<ColorMapping | undefined>(() => {
    if (!config?.colorMapping) {
      return data?.colorMapping
    }

    return {
      ...data?.colorMapping,
      ...config.colorMapping,
      mode: config.colorMapping.mode ?? data?.colorMapping?.mode,
    }
  }, [config?.colorMapping, data?.colorMapping])

  const stats = useMemo(() => {
    if (!objects.length || !effectiveColorMapping?.column || effectiveColorMapping.mode === 'categorical') {
      return { min: undefined, max: undefined }
    }

    if (effectiveColorMapping.domain) {
      return { min: effectiveColorMapping.domain[0], max: effectiveColorMapping.domain[1] }
    }

    const values = objects
      .map((d) => Number(d[effectiveColorMapping.column!]))
      .filter((v) => Number.isFinite(v))
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [effectiveColorMapping, objects])

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      loadFromFile(file)
    }
  }

  const onConfigFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const nextConfig = await parseVisualizationConfigFile(file)
      setConfig(nextConfig)
      setConfigError(null)
    } catch {
      setConfig(null)
      setConfigError('Invalid config file. Please check the JSON format.')
    }
  }

  return (
    <div className="relative h-[calc(100vh-48px)] w-full">
      <div className="absolute left-3 top-3 z-30 flex items-center gap-2">
        <Controls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
          onToggleLegend={() => setLegendVisible((v) => !v)}
          legendVisible={legendVisible}
          pointSize={pointSize}
          defaultPointSize={DEFAULT_POINT_SIZE}
          onPointSizeChange={setPointSize}
          onResetPointSize={() => setPointSize(DEFAULT_POINT_SIZE)}
          previewSize={previewSize}
          defaultPreviewSize={DEFAULT_PREVIEW_SIZE}
          onPreviewSizeChange={setPreviewSize}
          onResetPreviewSize={() => setPreviewSize(DEFAULT_PREVIEW_SIZE)}
          showDisplaySettings={showDisplaySettings}
          onToggleDisplaySettings={() => setShowDisplaySettings((v) => !v)}
        />
        <label className="flex cursor-pointer items-center gap-1 rounded-md bg-white/80 px-2 py-2 text-xs text-slate-700 shadow hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700 md:text-sm">
          <span className="hidden md:inline">Upload</span>
          <span className="md:hidden">⬆</span>
          <input type="file" accept=".csv,.csv.gz,.json" className="hidden" onChange={onFileChange} />
        </label>
        <label className="flex cursor-pointer items-center gap-1 rounded-md bg-white/80 px-2 py-2 text-xs text-slate-700 shadow hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700 md:text-sm">
          <span className="hidden md:inline">Upload config</span>
          <span className="md:hidden">Cfg</span>
          <input type="file" accept=".json" className="hidden" onChange={onConfigFileChange} />
        </label>
        <button
          type="button"
          onClick={() => setShowConfigHelp((v) => !v)}
          className="rounded-md bg-white/80 px-2 py-2 text-xs text-slate-700 shadow hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700 md:text-sm"
          aria-expanded={showConfigHelp}
          aria-controls="config-format-help"
        >
          Config format
        </button>
      </div>

      {showConfigHelp && (
        <div
          id="config-format-help"
          className="absolute left-3 top-16 z-30 max-w-xl rounded-md border border-slate-200 bg-white/95 p-3 text-xs text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200"
        >
          <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Visualization config JSON</p>
          <pre className="max-h-56 overflow-auto rounded bg-slate-100 p-2 text-[11px] text-slate-700 dark:bg-slate-950 dark:text-slate-300">{`{
  "shapeLabels": {
    "star": "Candidate",
    "circle": "Confirmed"
  },
  "colorMapping": {
    "type": "continuous",
    "column": "magnitude",
    "scale": "linear",
    "min": 17,
    "max": 23,
    "colorScheme": "viridis"
  }
}`}</pre>
          <pre className="mt-2 max-h-56 overflow-auto rounded bg-slate-100 p-2 text-[11px] text-slate-700 dark:bg-slate-950 dark:text-slate-300">{`{
  "colorMapping": {
    "type": "categorical",
    "column": "class",
    "categories": {
      "spiral": "#f97316",
      "elliptical": "#0ea5e9"
    }
  }
}`}</pre>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            For categorical mappings, categories may also be provided as a color-to-label dictionary.
          </p>
        </div>
      )}

      {loading && (
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <LoadingState message="Loading data..." />
        </div>
      )}
      {error && (
        <div className="absolute left-4 top-16 z-30 max-w-xs rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      )}
      {configError && (
        <div className="absolute left-4 top-28 z-30 max-w-xs rounded-md border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {configError}
        </div>
      )}

      <div className="relative h-full w-full">
        {!loading && objects.length > 0 && (
          <ScatterPlot
            data={objects}
            colorMapping={effectiveColorMapping}
            pointSize={pointSize}
            selected={selected}
            viewState={viewState}
            onViewStateChange={onViewStateChange}
            onHover={setHovered}
            onClick={(obj) => setSelected(obj)}
          />
        )}
        {!loading && objects.length === 0 && (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
            <p className="text-lg">Upload a CSV or JSON file to visualize embeddings</p>
          </div>
        )}
      </div>

      <Legend
        visible={legendVisible}
        onClose={() => setLegendVisible(false)}
        mapping={effectiveColorMapping}
        min={stats.min}
        max={stats.max}
        shapes={uniqueShapes}
        shapeLabels={config?.shapeLabels}
      />

      <ImageTooltip hovered={hovered} size={previewSize} />
      <DetailPanel selected={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
