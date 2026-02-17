import { useCallback, useRef } from 'react'

export function useImagePreload() {
  const cache = useRef<Map<string, HTMLImageElement>>(new Map())

  const preload = useCallback((url?: string) => {
    if (!url) return
    if (cache.current.has(url)) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    cache.current.set(url, img)
  }, [])

  return { preload, cache }
}
