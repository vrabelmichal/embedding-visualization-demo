import { useEffect, useState, useCallback, useRef } from 'react'
import type { LoadedData } from '../utils/types'
import { loadCSV, loadCSVGzip, loadFile, loadJSON } from '../utils/dataLoader'

const DEFAULT_URL = '/sample-data.json'

export function useDataLoader(initialUrl: string | null = DEFAULT_URL) {
  const [state, setState] = useState<LoadedData>({
    data: null,
    loading: initialUrl !== null,
    error: null,
  })
  const urlRef = useRef(initialUrl)

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
    if (!initialUrl) return

    let cancelled = false

    async function fetchInitial() {
      try {
        const data = initialUrl!.endsWith('.csv.gz')
          ? await loadCSVGzip(initialUrl!)
          : initialUrl!.endsWith('.csv')
            ? await loadCSV(initialUrl!)
            : await loadJSON(initialUrl!)
        if (!cancelled) setState({ data, loading: false, error: null })
      } catch (error) {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load data',
          })
      }
    }

    fetchInitial()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    setUrl: (target: string | null) => {
      urlRef.current = target
      if (target) {
        loadFromUrl(target)
      } else {
        setState({ data: null, loading: false, error: null })
      }
    },
    loadFromFile,
    reload: () => urlRef.current ? loadFromUrl(urlRef.current) : undefined,
  }
}
