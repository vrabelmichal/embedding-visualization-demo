import { useCallback, useEffect, useRef, useState } from 'react'
import type { ViewStateChangeParameters } from '@deck.gl/core'
import type { AstronomicalObject } from '../utils/types'

export interface EmbeddingViewState {
  target: [number, number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}

function targetsEqual(a: [number, number, number], b: [number, number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

function viewsEqual(a: EmbeddingViewState, b: EmbeddingViewState): boolean {
  return (
    a.zoom === b.zoom &&
    a.minZoom === b.minZoom &&
    a.maxZoom === b.maxZoom &&
    targetsEqual(a.target, b.target)
  )
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

function extractTarget(value: unknown): [number, number, number] {
  if (Array.isArray(value)) {
    return [Number(value[0]) || 0, Number(value[1]) || 0, Number(value[2]) || 0]
  }
  if (value && typeof value === 'object' && '0' in value) {
    const arr = value as Record<number, number>
    return [Number(arr[0]) || 0, Number(arr[1]) || 0, Number(arr[2]) || 0]
  }
  return [0, 0, 0]
}

export function useViewState(objects: AstronomicalObject[]) {
  const [viewState, setViewState] = useState<EmbeddingViewState>(() =>
    computeInitialView(objects),
  )

  const objectsRef = useRef(objects)
  useEffect(() => {
    objectsRef.current = objects
  }, [objects])

  useEffect(() => {
    const initialView = computeInitialView(objects)
    const handle = requestAnimationFrame(() => {
      setViewState((prev) => (viewsEqual(prev, initialView) ? prev : initialView))
    })
    return () => cancelAnimationFrame(handle)
  }, [objects])

  const onViewStateChange = useCallback(
    ({ viewState: next }: ViewStateChangeParameters<EmbeddingViewState>) => {
      const nextTarget = extractTarget(next.target)
      const parsedZoom = Number(next.zoom)
      setViewState((prev) => {
        const nextZoom = Number.isFinite(parsedZoom) ? parsedZoom : prev.zoom
        if (prev.zoom === nextZoom && targetsEqual(prev.target, nextTarget)) {
          return prev
        }
        return {
          zoom: nextZoom,
          target: nextTarget,
          minZoom: prev.minZoom,
          maxZoom: prev.maxZoom,
        }
      })
    },
    [],
  )

  const resetView = useCallback(() => {
    setViewState(computeInitialView(objectsRef.current))
  }, [])

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
