import Papa from 'papaparse'
import type { AstronomicalObject, VisualizationData } from './types'
import { validateShape } from './shapeRenderer'

export async function loadJSON(url: string): Promise<VisualizationData> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.statusText}`)
  }
  const data = (await response.json()) as VisualizationData
  data.objects = (data.objects ?? []).map(normalizeObject)
  return data
}

export async function loadCSV(url: string): Promise<VisualizationData> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.statusText}`)
  }
  const text = await response.text()
  const parsed = Papa.parse(text, { header: true, dynamicTyping: true })
  const objects = (parsed.data as Papa.ParseResult<AstronomicalObject>['data'])
    .map(normalizeObject)
    .filter(isValidObject)
  return { objects }
}

export async function loadFile(file: File): Promise<VisualizationData> {
  const ext = file.name.toLowerCase()
  if (ext.endsWith('.json')) {
    const text = await file.text()
    const data = JSON.parse(text) as VisualizationData
    data.objects = (data.objects ?? []).map(normalizeObject)
    return data
  }
  if (ext.endsWith('.csv')) {
    const text = await file.text()
    const parsed = Papa.parse(text, { header: true, dynamicTyping: true })
    const objects = (parsed.data as Papa.ParseResult<AstronomicalObject>['data'])
      .map(normalizeObject)
      .filter(isValidObject)
    return { objects }
  }
  throw new Error('Unsupported file format. Please provide CSV or JSON.')
}

function normalizeObject(obj: any): AstronomicalObject {
  return {
    ...obj,
    coadd_object_id: String(obj.coadd_object_id ?? obj.id ?? ''),
    embedding_x: Number(obj.embedding_x ?? obj.x ?? 0),
    embedding_y: Number(obj.embedding_y ?? obj.y ?? 0),
    image_url: obj.image_url ?? obj.url ?? '',
    color: obj.color,
    embedding_shape: validateShape(obj.embedding_shape),
  }
}

function isValidObject(obj: AstronomicalObject): boolean {
  return obj.coadd_object_id !== '' && obj.coadd_object_id !== 'undefined' && obj.coadd_object_id !== 'null'
}
