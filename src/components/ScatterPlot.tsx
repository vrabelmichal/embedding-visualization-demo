import { useMemo, useState, useEffect, useRef } from 'react'
import DeckGL from '@deck.gl/react'
import { IconLayer } from '@deck.gl/layers'
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core'
import type { AstronomicalObject, ColorMapping } from '../utils/types'
import { useShapeMapping } from '../hooks/useShapeMapping'
import { useColorMapping } from '../hooks/useColorMapping'
import type { EmbeddingViewState } from '../hooks/useViewState'
import { validateShape } from '../utils/shapeRenderer'

interface ScatterPlotProps {
  data: AstronomicalObject[]
  colorMapping?: ColorMapping
  pointSize: number
  selected: AstronomicalObject | null
  viewState: EmbeddingViewState
  onViewStateChange: (params: any) => void
  onHover: (info: { object: AstronomicalObject; x: number; y: number } | null) => void
  onClick: (object: AstronomicalObject | null) => void
}

const ALL_SHAPES = [
  'star', 'triangle', 'square', 'pentagon', 'hexagon',
  'polygon', 'diamond', 'circle', 'rectangle', 'ring',
]

function buildAtlas(): { atlas: string; mapping: Record<string, { x: number; y: number; width: number; height: number; anchorY?: number; mask?: boolean }> } {
  const size = 128
  const padding = 2
  const cols = 3
  const allIcons = [...ALL_SHAPES]
  const atlasWidth = cols * (size + padding) + padding
  const rows = Math.ceil(allIcons.length / cols)
  const atlasHeight = rows * (size + padding) + padding

  const canvas = document.createElement('canvas')
  canvas.width = atlasWidth
  canvas.height = atlasHeight
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, atlasWidth, atlasHeight)

  const mapping: Record<string, { x: number; y: number; width: number; height: number; anchorY?: number; mask?: boolean }> = {}

  allIcons.forEach((shape, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    const x = padding + col * (size + padding)
    const y = padding + row * (size + padding)

    mapping[shape] = { x, y, width: size, height: size, anchorY: size / 2, mask: true }
  })

  allIcons.forEach((shape, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    const x = padding + col * (size + padding)
    const y = padding + row * (size + padding)

    const shapeCanvas = document.createElement('canvas')
    shapeCanvas.width = size
    shapeCanvas.height = size
    const shapeCtx = shapeCanvas.getContext('2d')
    if (!shapeCtx) return

    shapeCtx.clearRect(0, 0, size, size)
    shapeCtx.fillStyle = '#ffffff'

    if (shape === 'ring') {
      const cx = size / 2
      const cy = size / 2
      const outerR = size / 2
      const innerR = size / 2 - size * 0.12
      shapeCtx.beginPath()
      shapeCtx.arc(cx, cy, outerR, 0, Math.PI * 2)
      shapeCtx.arc(cx, cy, innerR, 0, Math.PI * 2, true)
      shapeCtx.closePath()
      shapeCtx.fill()
    } else if (shape === 'circle') {
      shapeCtx.beginPath()
      shapeCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      shapeCtx.closePath()
      shapeCtx.fill()
    } else {
      const shapePaths = getShapePoints(shape)
      shapeCtx.beginPath()
      shapePaths.forEach(([px, py], idx) => {
        const sx = (px / 100) * size
        const sy = (py / 100) * size
        if (idx === 0) shapeCtx.moveTo(sx, sy)
        else shapeCtx.lineTo(sx, sy)
      })
      shapeCtx.closePath()
      shapeCtx.fill()
    }

    ctx.drawImage(shapeCanvas, x, y, size, size)
  })

  return { atlas: canvas.toDataURL('image/png'), mapping }
}

function getShapePoints(shape: string): Array<[number, number]> {
  const shapes: Record<string, Array<[number, number]>> = {
    circle: [],
    rectangle: [[0, 0], [100, 0], [100, 100], [0, 100]],
    square: [[10, 10], [90, 10], [90, 90], [10, 90]],
    diamond: [[50, 0], [100, 50], [50, 100], [0, 50]],
    triangle: [[50, 0], [0, 100], [100, 100]],
    hexagon: [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]],
    pentagon: [[50, 0], [95, 35], [77, 100], [23, 100], [5, 35]],
    polygon: [[50, 0], [90, 20], [100, 60], [70, 100], [30, 100], [0, 60], [10, 20]],
    star: [[50, 0], [61, 35], [98, 35], [68, 57], [79, 91], [50, 70], [21, 91], [32, 57], [2, 35], [39, 35]],
  }
  return shapes[shape] ?? shapes.rectangle
}

export function ScatterPlot({
  data,
  colorMapping,
  pointSize,
  selected,
  viewState,
  onViewStateChange,
  onHover,
  onClick,
}: ScatterPlotProps) {
  useShapeMapping(data)
  const { getColor } = useColorMapping(data, colorMapping)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { atlas, mapping } = useMemo(() => buildAtlas(), [])

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
        iconAtlas: atlas,
        iconMapping: mapping,
        getIcon: (d: AstronomicalObject) => {
          const shape = validateShape(d.embedding_shape)
          return shape in mapping ? shape : 'rectangle'
        },
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
    [data, getColor, onClick, onHover, pointSize, atlas, mapping],
  )

  const highlightLayer = useMemo(() => {
    if (!selected) return null
    return new IconLayer({
      id: 'selected-highlight',
      data: [selected],
      pickable: false,
      iconAtlas: atlas,
      iconMapping: mapping,
      getIcon: () => 'ring',
      getPosition: (d: AstronomicalObject) => [d.embedding_x, d.embedding_y, 0],
      getColor: () => [255, 59, 48],
      getSize: pointSize * 1.5,
      sizeUnits: 'pixels',
      sizeScale: 1,
      parameters: { depthTest: false },
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    })
  }, [selected, pointSize, atlas, mapping])

  const layers = useMemo(() => {
    return [layer, highlightLayer].filter(Boolean) as any[]
  }, [layer, highlightLayer])

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
          layers={layers}
          viewState={viewState as any}
          onViewStateChange={onViewStateChange}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  )
}
