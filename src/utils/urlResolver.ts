const ABSOLUTE_URL_PATTERN = /^https?:\/\//i

export interface ResolvedUrls {
  emb: string
  cfg: string
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
