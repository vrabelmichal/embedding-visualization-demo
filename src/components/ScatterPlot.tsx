import DeckGL from '@deck.gl/react'
import { IconLayer } from '@deck.gl/layers'
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core'
import type { AstronomicalObject, ColorMapping } from '../utils/types'
import { useShapeMapping } from '../hooks/useShapeMapping'
import { useColorMapping } from '../hooks/useColorMapping'
import type { EmbeddingViewState } from '../hooks/useViewState'
import { useMemo, useState, useEffect, useRef } from 'react'

interface ScatterPlotProps {
  data: AstronomicalObject[]
  colorMapping?: ColorMapping
  pointSize: number
  viewState: EmbeddingViewState
  onViewStateChange: (params: any) => void
  onHover: (info: { object: AstronomicalObject; x: number; y: number } | null) => void
  onClick: (object: AstronomicalObject | null) => void
}

export function ScatterPlot({
  data,
  colorMapping,
  pointSize,
  viewState,
  onViewStateChange,
  onHover,
  onClick,
}: ScatterPlotProps) {
  const { getIconForShape } = useShapeMapping(data)
  const { getColor } = useColorMapping(data, colorMapping)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const layer = useMemo(
    () =>
      new IconLayer({
        id: 'astronomy-points',
        data,
        pickable: true,
        getIcon: (d: AstronomicalObject) => getIconForShape(d.embedding_shape),
        getPosition: (d: AstronomicalObject) => [d.embedding_x, d.embedding_y, 0],
        getColor: (d: AstronomicalObject) => getColor(d),
        getSize: pointSize,
        sizeUnits: 'pixels',
        sizeScale: 1,
        sizeMinPixels: 4,
        sizeMaxPixels: 64,
        updateTriggers: {
          getSize: pointSize,
        },
        parameters: { depthTest: false },
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        onHover: ({ object, x, y }) =>
          onHover(object ? ({ object, x, y } as any) : null),
        onClick: ({ object }) => onClick((object ?? null) as any),
      }),
    [data, getColor, getIconForShape, onClick, onHover, pointSize],
  )

  if (data.length === 0) {
    return null
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {mounted && (
        <DeckGL
          views={[new OrthographicView({ id: 'ortho', flipY: false })]}
          controller={{
            dragPan: true,
            dragRotate: false,
            scrollZoom: true,
            touchZoom: true,
            touchRotate: false,
          }}
          layers={[layer]}
          viewState={viewState as any}
          onViewStateChange={onViewStateChange}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  )
}
