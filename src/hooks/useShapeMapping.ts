import { useMemo } from 'react'
import type { AstronomicalObject, EmbeddingShape } from '../utils/types'
import { getShapeClipPath, getShapeDataUrl, validateShape } from '../utils/shapeRenderer'

export function useShapeMapping(data: AstronomicalObject[]) {
  const uniqueShapes = useMemo(() => {
    const set = new Set<EmbeddingShape>()
    data.forEach((d) => set.add(validateShape(d.embedding_shape)))
    return Array.from(set)
  }, [data])

  const getIconForShape = (shape?: string) => {
    const valid = validateShape(shape)
    return {
      url: getShapeDataUrl(valid),
      width: 128,
      height: 128,
      anchorY: 64,
      mask: true,
    }
  }

  const getClipPath = (shape?: string) => getShapeClipPath(validateShape(shape))

  return { uniqueShapes, getIconForShape, getClipPath }
}
