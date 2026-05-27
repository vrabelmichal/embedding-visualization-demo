export type EmbeddingShape =
  | 'star'
  | 'triangle'
  | 'square'
  | 'pentagon'
  | 'hexagon'
  | 'polygon'
  | 'diamond'
  | 'circle'
  | 'rectangle'

export interface AstronomicalObject {
  coadd_object_id: string
  embedding_x: number
  embedding_y: number
  image_url: string
  color?: string
  embedding_shape?: EmbeddingShape
  [key: string]: unknown
}

export interface ColorMapping {
  column?: string
  mode?: 'continuous' | 'categorical'
  scale?: 'linear' | 'log' | 'quantile' | 'categorical'
  colorScheme?: string
  domain?: [number, number]
  valueToColor?: Record<string, string>
  colorToLabel?: Record<string, string>
}

export interface VisualizationConfig {
  shapeLabels?: Partial<Record<EmbeddingShape, string>>
  colorMapping?: ColorMapping
}

export interface VisualizationData {
  objects: AstronomicalObject[]
  colorMapping?: ColorMapping
  metadata?: {
    title?: string
    description?: string
    totalObjects?: number
  }
}

export interface LoadedData {
  data: VisualizationData | null
  loading: boolean
  error: string | null
}
