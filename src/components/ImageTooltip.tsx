import { getShapeClipPath } from '../utils/shapeRenderer'
import type { AstronomicalObject } from '../utils/types'

interface ImageTooltipProps {
  hovered: { object: AstronomicalObject; x: number; y: number } | null
}

export function ImageTooltip({ hovered }: ImageTooltipProps) {
  if (!hovered || !hovered.object.image_url) return null
  const { object, x, y } = hovered
  const clipPath = getShapeClipPath((object.embedding_shape as any) || 'rectangle')

  return (
    <img
      src={object.image_url}
      alt={object.coadd_object_id}
      crossOrigin="anonymous"
      className="pointer-events-none fixed z-50 h-40 w-40 object-cover shadow-xl"
      style={{
        left: x + 12,
        top: y + 12,
        clipPath,
      }}
    />
  )
}
