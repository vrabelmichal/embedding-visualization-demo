import { useMemo, useState, useEffect, useRef } from 'react'
import DeckGL from '@deck.gl/react'
import { IconLayer } from '@deck.gl/layers'
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core'
import type { MapViewState, ViewStateChangeParameters } from '@deck.gl/core'
import type { AstronomicalObject, ColorMapping, ShapeMapping } from '../utils/types'
import { useShapeMapping } from '../hooks/useShapeMapping'
import { useColorMapping } from '../hooks/useColorMapping'
import type { EmbeddingViewState } from '../hooks/useViewState'
import { validateShape } from '../utils/shapeRenderer'

interface ScatterPlotProps {
  data: AstronomicalObject[]
  colorMapping?: ColorMapping
  shapeMapping?: ShapeMapping
  pointSize: number
  selected: AstronomicalObject | null
  viewState: EmbeddingViewState
  onViewStateChange: (params: ViewStateChangeParameters) => void
  onHover: (info: { object: AstronomicalObject; x: number; y: number } | null) => void
  onClick: (object: AstronomicalObject | null) => void
  useColorColumn: boolean
}

const ALL_SHAPES = [
  'star', 'triangle', 'square', 'pentagon', 'hexagon',
  'polygon', 'diamond', 'circle', 'rectangle', 'cross', 'x', 'plus', 'ring',
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
    cross: [[35, 0], [65, 0], [65, 35], [100, 35], [100, 55], [65, 55], [65, 100], [35, 100], [35, 55], [0, 55], [0, 35], [35, 35]],
    x: [[0, 0], [30, 0], [50, 20], [70, 0], [100, 0], [80, 30], [100, 50], [80, 70], [100, 100], [70, 100], [50, 80], [30, 100], [0, 100], [20, 70], [0, 50], [20, 30]],
    plus: [[30, 0], [70, 0], [70, 30], [100, 30], [100, 70], [70, 70], [70, 100], [30, 100], [30, 70], [0, 70], [0, 30], [30, 30]],
  }
  return shapes[shape] ?? shapes.rectangle
}

export function ScatterPlot({
  data,
  colorMapping,
  shapeMapping,
  pointSize,
  selected,
  viewState,
  onViewStateChange,
  onHover,
  onClick,
  useColorColumn,
}: ScatterPlotProps) {
  useShapeMapping(data)
  const { getColor } = useColorMapping(data, colorMapping, useColorColumn)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { atlas, mapping } = useMemo(() => buildAtlas(), [])

  const { otherData, mainData } = useMemo(() => {
    const hasCategoricalColor = colorMapping?.mode === 'categorical' && colorMapping.column && colorMapping.valueToColor
    const hasShapeCats = shapeMapping?.column && shapeMapping.valueToShape

    if (!hasCategoricalColor && !hasShapeCats) {
      return { otherData: [] as AstronomicalObject[], mainData: data }
    }

    const colorCategories = hasCategoricalColor ? colorMapping.valueToColor! : undefined
    const shapeCategories = hasShapeCats ? shapeMapping!.valueToShape! : undefined
    const colorCol = hasCategoricalColor ? colorMapping.column! : undefined
    const shapeCol = hasShapeCats ? shapeMapping!.column! : undefined

    const other: AstronomicalObject[] = []
    const main: AstronomicalObject[] = []

    for (const obj of data) {
      let isExplicitlyCategorized = false
      let hasOtherLabel = false

      if (colorCol && colorCategories) {
        const val = String(obj[colorCol] ?? '').trim()
        if (val) {
          if (val.toLowerCase().includes('other')) {
            hasOtherLabel = true
          }
          if (colorCategories[val]) {
            isExplicitlyCategorized = true
          }
        }
      }

      if (shapeCol && shapeCategories) {
        const val = String(obj[shapeCol] ?? '').trim()
        if (val) {
          if (val.toLowerCase().includes('other')) {
            hasOtherLabel = true
          }
          if (shapeCategories[val]) {
            isExplicitlyCategorized = true
          }
        }
      }

      if (hasOtherLabel) {
        other.push(obj)
      } else if (isExplicitlyCategorized) {
        main.push(obj)
      } else {
        other.push(obj)
      }
    }

    return { otherData: other, mainData: main }
  }, [data, colorMapping, shapeMapping])

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const sharedConfig = useMemo(
    () => ({
      pickable: true as const,
      iconAtlas: atlas,
      iconMapping: mapping,
      getIcon: shapeMapping?.column && shapeMapping.valueToShape
        ? (d: AstronomicalObject) => {
            const value = String(d[shapeMapping.column!] ?? '').trim()
            const shape = shapeMapping.valueToShape![value] ?? shapeMapping.defaultShape
            if (shape && shape in mapping) return shape
            return validateShape(d.embedding_shape)
          }
        : (d: AstronomicalObject) => validateShape(d.embedding_shape),
      getPosition: (d: AstronomicalObject): [number, number, number] => [d.embedding_x, d.embedding_y, 0],
      getSize: pointSize,
      sizeUnits: 'pixels' as const,
      sizeScale: 1,
      sizeMinPixels: 4,
      sizeMaxPixels: 64,
      parameters: { depthTest: false },
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    }),
    [atlas, mapping, shapeMapping, pointSize],
  )

  const commonUpdateTriggers = useMemo(
    () => ({
      getColor: [colorMapping, useColorColumn],
      getIcon: [shapeMapping],
      getSize: pointSize,
    }),
    [colorMapping, useColorColumn, shapeMapping, pointSize],
  )

  const otherLayer = useMemo(() => {
    if (otherData.length === 0) return null
    return new IconLayer({
      ...sharedConfig,
      id: 'astronomy-points-other',
      data: otherData,
      getColor: (d: AstronomicalObject) => getColor(d),
      updateTriggers: commonUpdateTriggers,
      onHover: ({ object, x, y }) =>
        onHover(object ? ({ object, x, y } as { object: AstronomicalObject; x: number; y: number }) : null),
      onClick: ({ object }) => onClick((object ?? null) as unknown as AstronomicalObject | null),
    })
  }, [otherData, sharedConfig, getColor, commonUpdateTriggers, onHover, onClick])

  const mainLayer = useMemo(() => {
    if (mainData.length === 0) return null
    return new IconLayer({
      ...sharedConfig,
      id: 'astronomy-points-main',
      data: mainData,
      getColor: (d: AstronomicalObject) => getColor(d),
      updateTriggers: commonUpdateTriggers,
      onHover: ({ object, x, y }) =>
        onHover(object ? ({ object, x, y } as { object: AstronomicalObject; x: number; y: number }) : null),
      onClick: ({ object }) => onClick((object ?? null) as unknown as AstronomicalObject | null),
    })
  }, [mainData, sharedConfig, getColor, commonUpdateTriggers, onHover, onClick])

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
    return [otherLayer, mainLayer, highlightLayer].filter((l): l is IconLayer => l !== null)
  }, [otherLayer, mainLayer, highlightLayer])

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
          viewState={viewState as unknown as MapViewState}
          onViewStateChange={onViewStateChange}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  )
}
