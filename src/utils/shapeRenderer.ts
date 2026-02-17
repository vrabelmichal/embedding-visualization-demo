import type { EmbeddingShape } from './types'

const VALID_SHAPES: EmbeddingShape[] = [
  'star',
  'triangle',
  'square',
  'pentagon',
  'hexagon',
  'polygon',
  'diamond',
  'circle',
  'rectangle',
]

const shapeCache = new Map<EmbeddingShape, string>()

export function validateShape(shape?: string): EmbeddingShape {
  if (!shape) return 'rectangle'
  return VALID_SHAPES.includes(shape as EmbeddingShape)
    ? (shape as EmbeddingShape)
    : 'rectangle'
}

export function getShapeClipPath(shape: EmbeddingShape): string {
  const shapes: Record<EmbeddingShape, string> = {
    circle: 'circle(50%)',
    diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    square: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    rectangle: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    hexagon:
      'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    pentagon:
      'polygon(50% 0%, 95% 35%, 77% 100%, 23% 100%, 5% 35%)',
    polygon:
      'polygon(50% 0%, 90% 20%, 100% 60%, 70% 100%, 30% 100%, 0% 60%, 10% 20%)',
    star:
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  }
  return shapes[shape] ?? shapes.rectangle
}

export function getShapeDataUrl(shape: EmbeddingShape, size = 128): string {
  const cached = shapeCache.get(shape)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return ''
  }

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'

  const drawPolygon = (points: Array<[number, number]>) => {
    ctx.beginPath()
    points.forEach(([x, y], idx) => {
      const px = (x / 100) * size
      const py = (y / 100) * size
      if (idx === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.closePath()
    ctx.fill()
  }

  const shapes: Record<EmbeddingShape, Array<[number, number]>> = {
    circle: [],
    rectangle: [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ],
    square: [
      [10, 10],
      [90, 10],
      [90, 90],
      [10, 90],
    ],
    diamond: [
      [50, 0],
      [100, 50],
      [50, 100],
      [0, 50],
    ],
    triangle: [
      [50, 0],
      [0, 100],
      [100, 100],
    ],
    hexagon: [
      [25, 0],
      [75, 0],
      [100, 50],
      [75, 100],
      [25, 100],
      [0, 50],
    ],
    pentagon: [
      [50, 0],
      [95, 35],
      [77, 100],
      [23, 100],
      [5, 35],
    ],
    polygon: [
      [50, 0],
      [90, 20],
      [100, 60],
      [70, 100],
      [30, 100],
      [0, 60],
      [10, 20],
    ],
    star: [
      [50, 0],
      [61, 35],
      [98, 35],
      [68, 57],
      [79, 91],
      [50, 70],
      [21, 91],
      [32, 57],
      [2, 35],
      [39, 35],
    ],
  }

  if (shape === 'circle') {
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  } else {
    drawPolygon(shapes[shape] ?? shapes.rectangle)
  }

  const url = canvas.toDataURL('image/png')
  shapeCache.set(shape, url as string)
  return url
}
