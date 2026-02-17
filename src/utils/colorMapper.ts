import { scaleLinear, scaleLog, scaleQuantile } from 'd3-scale'
import type { AstronomicalObject, ColorMapping } from './types'

const DEFAULT_COLOR = [66, 153, 225, 200] as [number, number, number, number]

const SCHEMES: Record<string, string[]> = {
  viridis: ['#440154', '#31688e', '#35b779', '#fde724'],
  plasma: ['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921'],
  turbo: ['#30123b', '#4777ef', '#1ac7c2', '#a0fc3c', '#faba39'],
  blues: ['#f7fbff', '#c6dbef', '#6baed6', '#2171b5'],
}

function hexToRgba(hex: string, alpha = 1): [number, number, number, number] {
  const normalized = hex.replace('#', '')
  if (![3, 6].includes(normalized.length)) return DEFAULT_COLOR
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  const num = parseInt(value, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return [r, g, b, Math.round(alpha * 255)]
}

export function getColorScale(
  data: AstronomicalObject[],
  mapping?: ColorMapping,
) {
  if (!mapping?.column) return null
  const values = data
    .map((d) => Number(d[mapping.column!]))
    .filter((v) => Number.isFinite(v))
  if (!values.length) return null
  const domain = mapping.domain ?? [Math.min(...values), Math.max(...values)]
  const scheme = SCHEMES[mapping.colorScheme ?? 'viridis'] ?? SCHEMES.viridis

  const scale = (
    mapping.scale === 'log'
      ? scaleLog()
      : mapping.scale === 'quantile'
        ? scaleQuantile()
        : scaleLinear()
  ) as any

  scale.domain(domain).range(scheme)
  return (value: number) => hexToRgba(scale(value) as string, 0.9)
}

export function colorForObject(
  obj: AstronomicalObject,
  colorScale: ((value: number) => [number, number, number, number]) | null,
  mapping?: ColorMapping,
): [number, number, number, number] {
  if (obj.color && typeof obj.color === 'string') {
    return hexToRgba(obj.color, 0.95)
  }
  if (colorScale && mapping?.column) {
    const value = Number(obj[mapping.column])
    if (Number.isFinite(value)) {
      return colorScale(value)
    }
  }
  return DEFAULT_COLOR
}

export const legendColors = (mapping?: ColorMapping) =>
  SCHEMES[mapping?.colorScheme ?? 'viridis'] ?? SCHEMES.viridis
