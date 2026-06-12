import { getShapeClipPath, validateShape } from '../utils/shapeRenderer'
import type { AstronomicalObject } from '../utils/types'

interface ImageTooltipProps {
  hovered: { object: AstronomicalObject; x: number; y: number } | null
  size: number
}

export function ImageTooltip({ hovered, size }: ImageTooltipProps) {
  if (!hovered || !hovered.object.image_url) return null
  const { object, x, y } = hovered
  const clipPath = getShapeClipPath(validateShape(object.embedding_shape))

  return (
    <img
      src={object.image_url}
      alt={object.coadd_object_id}
      crossOrigin="anonymous"
      className="pointer-events-none fixed z-50 object-cover shadow-xl"
      style={{
        left: x + 12,
        top: y + 12,
        width: size,
        height: size,
        clipPath,
      }}
    />
  )
}
