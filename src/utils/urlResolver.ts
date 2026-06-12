const ABSOLUTE_URL_PATTERN = /^https?:\/\//i

export interface ResolvedUrls {
  emb: string
  cfg: string
}

export interface DisplayUrls {
  emb: string
  cfg: string
  embHref: string | null
  cfgHref: string | null
}

export function getDisplayUrls(): DisplayUrls | null {
  const params = new URLSearchParams(window.location.search)
  const emb = params.get('emb')
  const cfg = params.get('cfg')
  if (!emb && !cfg) return null

  const base = params.get('base')

  try {
    return {
      emb: sanitizeDisplayUrl(emb || '', base),
      cfg: sanitizeDisplayUrl(cfg || '', base),
      embHref: buildDisplayHref(emb || '', base),
      cfgHref: buildDisplayHref(cfg || '', base),
    }
  } catch {
    return null
  }
}

function buildDisplayHref(raw: string, base: string | null): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href
    }
    return null
  } catch {
    if (base) {
      try {
        const url = new URL(raw, base)
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return url.href
        }
      } catch {
        // fall through
      }
    }
  }
  return null
}

function sanitizeDisplayUrl(raw: string, base: string | null): string {
  if (!raw) return ''

  let url: URL
  let hasRealOrigin = false

  try {
    url = new URL(raw)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      hasRealOrigin = true
    }
  } catch {
    if (base) {
      try {
        url = new URL(raw, base)
        hasRealOrigin = true
      } catch {
        try {
          url = new URL(raw, 'http://_')
        } catch {
          return raw.slice(0, 200)
        }
      }
    } else {
      try {
        url = new URL(raw, 'http://_')
      } catch {
        return raw.slice(0, 200)
      }
    }
  }

  const path = url.pathname
  const origin = hasRealOrigin ? url.origin : ''

  if (path && path !== '/') return origin + path

  if (hasRealOrigin) return origin + '/'

  try {
    const segments = decodeURIComponent(raw).split('/')
    return segments[segments.length - 1] || raw.slice(0, 200)
  } catch {
    return raw.slice(0, 200)
  }
}

export function isAbsoluteUrl(value: string): boolean {
  return ABSOLUTE_URL_PATTERN.test(value)
}

export function resolveParam(base: string | null, param: string): string {
  if (isAbsoluteUrl(param)) {
    return param
  }

  if (!base) {
    throw new Error(
      `Cannot resolve relative URL "${param}" because no base URL was provided. Ensure the "base" query parameter is set.`,
    )
  }

  try {
    const url = new URL(param, base)
    return url.href
  } catch {
    throw new Error(
      `Failed to construct absolute URL from base "${base}" and parameter "${param}". Check that the values are valid URL components.`,
    )
  }
}

function validateAbsolute(url: string, label: string): string {
  if (!isAbsoluteUrl(url)) {
    throw new Error(
      `Resolved ${label} URL "${url}" is not a valid absolute URL. Only http:// and https:// schemes are allowed.`,
    )
  }
  return url
}

export function parseAndResolveUrls(): ResolvedUrls {
  const params = new URLSearchParams(window.location.search)
  const base = params.get('base')
  const emb = params.get('emb')
  const cfg = params.get('cfg')

  if (!emb) {
    throw new Error(
      'Missing required query parameter "emb". Provide the embedding data file URL or filename.',
    )
  }
  if (!cfg) {
    throw new Error(
      'Missing required query parameter "cfg". Provide the visualization config file URL or filename.',
    )
  }

  const resolvedEmb = resolveParam(base, emb)
  const resolvedCfg = resolveParam(base, cfg)

  return {
    emb: validateAbsolute(resolvedEmb, 'embedding'),
    cfg: validateAbsolute(resolvedCfg, 'configuration'),
  }
}

export function buildCompanionUrl(
  base: string | null,
  emb: string,
  cfg: string,
): string {
  const target = new URL(window.location.origin + window.location.pathname)
  if (base) {
    target.searchParams.set('base', encodeURIComponent(base))
  }
  target.searchParams.set('emb', encodeURIComponent(emb))
  target.searchParams.set('cfg', encodeURIComponent(cfg))
  return target.href
}
