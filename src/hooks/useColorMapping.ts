import { useMemo } from 'react'
import type { AstronomicalObject, ColorMapping } from '../utils/types'
import { colorForObject, getColorScale } from '../utils/colorMapper'

export function useColorMapping(
  data: AstronomicalObject[],
  mapping?: ColorMapping,
  useColorColumn = true,
) {
  const colorScale = useMemo(() => getColorScale(data, mapping), [data, mapping])
  const getColor = (obj: AstronomicalObject) =>
    colorForObject(obj, colorScale, mapping, useColorColumn)
  return { colorScale, getColor }
}
