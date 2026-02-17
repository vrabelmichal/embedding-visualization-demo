import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const COUNT = 60000
const shapes = [
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

function randomColor() {
  const n = Math.floor(Math.random() * 0xffffff)
  return `#${n.toString(16).padStart(6, '0')}`
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function generateObject(i) {
  const shape = shapes[Math.floor(Math.random() * shapes.length)]
  const maybeColor = Math.random() < 0.35 ? randomColor() : undefined
  return {
    coadd_object_id: `MOCK_${String(i).padStart(5, '0')}`,
    embedding_x: Number(randomBetween(-5, 5).toFixed(3)),
    embedding_y: Number(randomBetween(-5, 5).toFixed(3)),
    image_url: `https://picsum.photos/seed/mock${i}/256/256`,
    color: maybeColor,
    embedding_shape: shape,
    magnitude: Number(randomBetween(17, 23).toFixed(2)),
    redshift: Number(randomBetween(0.02, 0.08).toFixed(4)),
    surface_brightness: Number(randomBetween(22, 26).toFixed(2)),
  }
}

function main() {
  const objects = Array.from({ length: COUNT }, (_, i) => generateObject(i + 1))
  const data = {
    metadata: {
      title: 'Mock Large Dataset',
      description: `Generated mock dataset with ${COUNT} entries`,
      totalObjects: COUNT,
    },
    colorMapping: {
      column: 'magnitude',
      scale: 'linear',
      colorScheme: 'viridis',
      domain: [17, 23],
    },
    objects,
  }

  const outPath = resolve('public', 'mock-large.json')
  writeFileSync(outPath, JSON.stringify(data))
  console.log(`Mock data written to ${outPath}`)
}

main()
