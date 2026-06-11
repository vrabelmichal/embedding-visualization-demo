import type { ColorMapping, EmbeddingShape, ShapeMapping, VisualizationConfig } from './types'

const VALID_SCALES = new Set(['linear', 'log', 'quantile'])
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
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
  'cross',
  'x',
  'plus',
]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isColorString(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value.trim())
}

function normalizeShapeLabels(input: unknown): VisualizationConfig['shapeLabels'] {
  if (!isPlainObject(input)) return undefined

  const entries = Object.entries(input).filter(
    ([shape, label]) =>
      VALID_SHAPES.includes(shape as EmbeddingShape) && typeof label === 'string' && label.trim(),
  )

  if (!entries.length) return undefined

  return Object.fromEntries(entries) as VisualizationConfig['shapeLabels']
}

function normalizeShapeMapping(input: unknown): ShapeMapping | undefined {
  if (!isPlainObject(input)) return undefined

  const column = typeof input.column === 'string' ? input.column : undefined
  if (!column) return undefined

  const rawCategories = input.categories ?? input.valueToShape
  if (!isPlainObject(rawCategories)) return undefined

  const valueToShape: Record<string, EmbeddingShape> = {}

  Object.entries(rawCategories).forEach(([key, value]) => {
    if (typeof value !== 'string') return
    const trimmedValue = value.trim() as EmbeddingShape
    if (VALID_SHAPES.includes(trimmedValue)) {
      valueToShape[key.trim()] = trimmedValue
    }
  })

  if (!Object.keys(valueToShape).length) return undefined

  const rawDefault = input.defaultShape ?? input.default_shape
  const defaultShape =
    typeof rawDefault === 'string' && VALID_SHAPES.includes(rawDefault.trim() as EmbeddingShape)
      ? (rawDefault.trim() as EmbeddingShape)
      : undefined

  return {
    column,
    valueToShape,
    defaultShape,
  }
}

function normalizeCategoricalMap(
  input: unknown,
): Pick<ColorMapping, 'valueToColor' | 'colorToLabel'> {
  if (!isPlainObject(input)) {
    return {}
  }

  const valueToColor: Record<string, string> = {}
  const colorToLabel: Record<string, string> = {}

  Object.entries(input).forEach(([key, value]) => {
    if (typeof value !== 'string') return
    const trimmedKey = key.trim()
    const trimmedValue = value.trim()

    if (isColorString(trimmedKey)) {
      colorToLabel[trimmedKey] = trimmedValue
      valueToColor[trimmedValue] = trimmedKey
      return
    }

    if (isColorString(trimmedValue)) {
      valueToColor[trimmedKey] = trimmedValue
      colorToLabel[trimmedValue] = trimmedKey
    }
  })

  return {
    valueToColor: Object.keys(valueToColor).length ? valueToColor : undefined,
    colorToLabel: Object.keys(colorToLabel).length ? colorToLabel : undefined,
  }
}

function normalizeColorMapping(input: unknown): ColorMapping | undefined {
  if (!isPlainObject(input)) return undefined

  const rawType =
    typeof input.type === 'string'
      ? input.type.toLowerCase()
      : typeof input.mode === 'string'
        ? input.mode.toLowerCase()
        : undefined

  const column = typeof input.column === 'string' ? input.column : undefined

  if (rawType === 'categorical' || rawType === 'discrete') {
    const categories = normalizeCategoricalMap(
      input.categories ?? input.valueToColor ?? input.colorToLabel,
    )

    const rawDefaultColor =
      typeof input.defaultColor === 'string'
        ? input.defaultColor.trim()
        : typeof input.default_color === 'string'
          ? input.default_color.trim()
          : undefined
    const defaultColor =
      rawDefaultColor && HEX_COLOR_PATTERN.test(rawDefaultColor) ? rawDefaultColor : undefined

    return {
      mode: 'categorical',
      scale: 'categorical',
      column,
      valueToColor: categories.valueToColor,
      colorToLabel: categories.colorToLabel,
      defaultColor,
    }
  }

  const scale =
    typeof input.scale === 'string' && VALID_SCALES.has(input.scale)
      ? (input.scale as ColorMapping['scale'])
      : 'linear'
  const min = Number(input.min)
  const max = Number(input.max)
  const domain = Number.isFinite(min) && Number.isFinite(max) ? ([min, max] as [number, number]) : undefined

  return {
    mode: 'continuous',
    column,
    scale,
    colorScheme: typeof input.colorScheme === 'string' ? input.colorScheme : undefined,
    domain,
  }
}

export function parseVisualizationConfigText(text: string): VisualizationConfig {
  const parsed = JSON.parse(text) as unknown
  if (!isPlainObject(parsed)) {
    throw new Error('Visualization config must be a JSON object.')
  }

  return {
    shapeLabels: normalizeShapeLabels(parsed.shapeLabels),
    shapeMapping: normalizeShapeMapping(parsed.shapeMapping),
    colorMapping: normalizeColorMapping(parsed.colorMapping),
  }
}

export async function parseVisualizationConfigFile(file: File): Promise<VisualizationConfig> {
  const text = await file.text()
  return parseVisualizationConfigText(text)
}

export async function fetchVisualizationConfigFromUrl(url: string): Promise<VisualizationConfig> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`Failed to load config from ${url}: ${response.statusText}`)
  }
  const text = await response.text()
  return parseVisualizationConfigText(text)
}
