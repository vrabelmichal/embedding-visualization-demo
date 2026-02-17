import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ViewStateChangeParameters } from '@deck.gl/core'
import type { AstronomicalObject } from '../utils/types'

export interface EmbeddingViewState {
  target: [number, number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}

function computeInitialView(objects: AstronomicalObject[]): EmbeddingViewState {
  if (!objects.length) {
    return { target: [0, 0, 0], zoom: 0, minZoom: -10, maxZoom: 10 }
  }
  const xs = objects.map((o) => o.embedding_x)
  const ys = objects.map((o) => o.embedding_y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const span = Math.max(maxX - minX, maxY - minY) || 1
  const zoom = Math.log2(800 / span)
  return {
    target: [centerX, centerY, 0],
    zoom: Math.max(Math.min(zoom, 10), -10),
    minZoom: -10,
    maxZoom: 10,
  }
}

export function useViewState(objects: AstronomicalObject[]) {
  const initial = useMemo(() => computeInitialView(objects), [objects])
  const [viewState, setViewState] = useState<EmbeddingViewState>(initial)

  // Reset view when dataset changes
  useEffect(() => {
    setViewState(initial)
  }, [initial])

  const onViewStateChange = useCallback(
    ({ viewState: next }: ViewStateChangeParameters<EmbeddingViewState>) => {
      setViewState((prev) => ({
        ...prev,
        ...next,
      }))
    },
    [],
  )

  const resetView = useCallback(() => setViewState(initial), [initial])
  const zoomIn = useCallback(
    () => setViewState((v) => ({ ...v, zoom: Math.min(v.zoom + 1, v.maxZoom) })),
    [],
  )
  const zoomOut = useCallback(
    () => setViewState((v) => ({ ...v, zoom: Math.max(v.zoom - 1, v.minZoom) })),
    [],
  )

  return { viewState, onViewStateChange, resetView, zoomIn, zoomOut }
}
