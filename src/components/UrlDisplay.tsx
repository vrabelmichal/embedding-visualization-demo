import { useMemo } from 'react'
import type { DisplayUrls } from '../utils/urlResolver'

interface Props {
  urls: DisplayUrls
}

const ELLIPSIS_LEFT: React.CSSProperties = {
  direction: 'rtl',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  minWidth: 0,
  maxWidth: '100%',
  verticalAlign: 'bottom',
}

function EllipsisLeft({ children }: { children: React.ReactNode }) {
  return (
    <span style={ELLIPSIS_LEFT}>
      <span dir="ltr">{children}</span>
    </span>
  )
}

function pathLink(href: string | null, displayText: string) {
  if (!href) return <span title={displayText}>{displayText}</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
      title={displayText}
    >
      {displayText}
    </a>
  )
}

export function UrlDisplay({ urls }: Props) {
  const embPath = urls.emb || ''
  const cfgPath = urls.cfg || ''

  const { commonPrefix, embDisplay, cfgDisplay } = useMemo(() => {
    const embParts = embPath.split('/')
    const cfgParts = cfgPath.split('/')
    const embFile = embParts.pop() || embPath
    const cfgFile = cfgParts.pop() || cfgPath

    let i = 0
    while (
      i < embParts.length &&
      i < cfgParts.length &&
      embParts[i] === cfgParts[i]
    ) {
      i++
    }
    const commonPrefix = embParts.slice(0, i).join('/') + (i > 0 ? '/' : '')

    const embDisplay =
      embParts.slice(i).join('/') +
      (embParts.length > i ? '/' : '') +
      embFile
    const cfgDisplay =
      cfgParts.slice(i).join('/') +
      (cfgParts.length > i ? '/' : '') +
      cfgFile

    return { commonPrefix, embDisplay, cfgDisplay }
  }, [embPath, cfgPath])

  return (
    <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden text-[11px] md:text-xs text-slate-400 dark:text-slate-500">
      {commonPrefix && (
        <span
          className="min-w-0"
          style={{ flexGrow: 0, flexShrink: 2, flexBasis: 'auto' }}
        >
          <EllipsisLeft>{commonPrefix}</EllipsisLeft>
        </span>
      )}

      <span
        className="min-w-0"
        style={{ flexGrow: 0, flexShrink: 0.3, flexBasis: 'auto' }}
      >
        <EllipsisLeft>
          {pathLink(urls.embHref, embDisplay)}
        </EllipsisLeft>
      </span>

      {cfgDisplay && (
        <>
          <span
            className="shrink-0 text-slate-300/60 dark:text-slate-600/60"
            aria-hidden="true"
          >
            &#8226;
          </span>
          <span
            className="min-w-0"
            style={{ flexGrow: 0, flexShrink: 1.5, flexBasis: 'auto' }}
          >
            <EllipsisLeft>
              {pathLink(urls.cfgHref, cfgDisplay)}
            </EllipsisLeft>
          </span>
        </>
      )}
    </div>
  )
}
