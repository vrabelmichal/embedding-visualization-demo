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
import type { AstronomicalObject } from '../utils/types'

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

  const stats = useMemo(() => {
    if (!objects.length || !data?.colorMapping?.column) return { min: undefined, max: undefined }
    const values = objects
      .map((d) => Number(d[data.colorMapping!.column!]))
      .filter((v) => Number.isFinite(v))
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [objects, data?.colorMapping])

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      loadFromFile(file)
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
        />
        <label className="flex cursor-pointer items-center gap-1 rounded-md bg-slate-800/80 px-2 py-2 text-xs text-slate-100 shadow hover:bg-slate-700 md:text-sm">
          <span className="hidden md:inline">Upload</span>
          <span className="md:hidden">⬆</span>
          <input type="file" accept=".csv,.json" className="hidden" onChange={onFileChange} />
        </label>
      </div>

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

      <div className="relative h-full w-full">
        {!loading && (
          <ScatterPlot
            data={objects}
            colorMapping={data?.colorMapping}
            viewState={viewState}
            onViewStateChange={onViewStateChange}
            onHover={setHovered}
            onClick={(obj) => setSelected(obj)}
          />
        )}
      </div>

      <Legend
        visible={legendVisible}
        onClose={() => setLegendVisible(false)}
        mapping={data?.colorMapping}
        min={stats.min}
        max={stats.max}
        shapes={uniqueShapes}
      />

      <ImageTooltip hovered={hovered} />
      <DetailPanel selected={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
