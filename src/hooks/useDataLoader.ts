import { useEffect, useState, useCallback } from 'react'
import type { LoadedData } from '../utils/types'
import { loadCSV, loadCSVGzip, loadFile, loadJSON } from '../utils/dataLoader'

const DEFAULT_URL = '/sample-data.json'

export function useDataLoader(initialUrl: string | null = DEFAULT_URL) {
  const [state, setState] = useState<LoadedData>({
    data: null,
    loading: !initialUrl ? false : true,
    error: null,
  })
  const [url, setUrl] = useState<string | null>(initialUrl)

  const loadFromUrl = useCallback(async (target: string) => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = target.endsWith('.csv.gz')
        ? await loadCSVGzip(target)
        : target.endsWith('.csv')
          ? await loadCSV(target)
          : await loadJSON(target)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      })
    }
  }, [])

  const loadFromFile = useCallback(async (file: File) => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await loadFile(file)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load file',
      })
    }
  }, [])

  useEffect(() => {
    if (url) {
      loadFromUrl(url)
    }
  }, [url, loadFromUrl])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    setUrl,
    loadFromFile,
    reload: () => url ? loadFromUrl(url) : undefined,
  }
}
