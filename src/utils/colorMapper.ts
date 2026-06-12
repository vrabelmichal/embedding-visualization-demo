import { color as parseColor } from 'd3-color'
import { scaleLinear, scaleLog, scaleQuantile } from 'd3-scale'
import type { AstronomicalObject, ColorMapping } from './types'

const DEFAULT_COLOR = [66, 153, 225, 200] as [number, number, number, number]

const SCHEMES: Record<string, string[]> = {
  viridis: ['#440154', '#31688e', '#35b779', '#fde724'],
  plasma: ['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921'],
  turbo: ['#30123b', '#4777ef', '#1ac7c2', '#a0fc3c', '#faba39'],
  blues: ['#f7fbff', '#c6dbef', '#6baed6', '#2171b5'],
}

function colorToRgba(input: string, alpha = 1): [number, number, number, number] {
  const parsed = parseColor(input)?.rgb()
  if (!parsed) return DEFAULT_COLOR

  return [
    Math.round(parsed.r),
    Math.round(parsed.g),
    Math.round(parsed.b),
    Math.round(alpha * parsed.opacity * 255),
  ]
}

export function getColorScale(
  data: AstronomicalObject[],
  mapping?: ColorMapping,
) {
  if (!mapping?.column || mapping.mode === 'categorical') return null
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
  return (value: number) => colorToRgba(String(scale(value)), 0.9)
}

export function hasCompleteColorMapping(mapping?: ColorMapping): boolean {
  if (!mapping) return false
  if (mapping.mode === 'categorical') {
    return Boolean(mapping.column && mapping.valueToColor)
  }
  return Boolean(mapping.column && mapping.scale && mapping.colorScheme)
}

export function colorForObject(
  obj: AstronomicalObject,
  colorScale: ((value: number) => [number, number, number, number]) | null,
  mapping?: ColorMapping,
  useColorColumn = true,
): [number, number, number, number] {
  // 1. If the CSV color column is enabled and present, use it first.
  if (useColorColumn && obj.color && typeof obj.color === 'string') {
    return colorToRgba(obj.color, 0.95)
  }

  // 2. If mapping is categorical, use the value-to-color mapping.
  if (mapping?.mode === 'categorical' && mapping.column && mapping.valueToColor) {
    const value = String(obj[mapping.column] ?? '').trim()
    const color = mapping.valueToColor[value]
    if (color) {
      return colorToRgba(color, 0.92)
    }
    if (mapping.defaultColor) {
      return colorToRgba(mapping.defaultColor, 0.92)
    }
  }
  // 3. If mapping is continuous and we have a color scale, compute the color.
  if (colorScale && mapping?.column && mapping.mode !== 'categorical') {
    const value = Number(obj[mapping.column])
    if (Number.isFinite(value)) {
      return colorScale(value)
    }
  }

  // 4. Otherwise use the default rendering color.
  return DEFAULT_COLOR
}

export const legendColors = (mapping?: ColorMapping) =>
  SCHEMES[mapping?.colorScheme ?? 'viridis'] ?? SCHEMES.viridis

export function categoricalLegendItems(mapping?: ColorMapping): Array<{ color: string; label: string }> {
  if (mapping?.mode !== 'categorical') return []

  if (mapping.colorToLabel) {
    return Object.entries(mapping.colorToLabel).map(([color, label]) => ({ color, label }))
  }

  if (mapping.valueToColor) {
    return Object.entries(mapping.valueToColor).map(([label, color]) => ({ color, label }))
  }

  return []
}
