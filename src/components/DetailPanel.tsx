import type { AstronomicalObject } from '../utils/types'

interface DetailPanelProps {
  selected: AstronomicalObject | null
  onClose: () => void
}

export function DetailPanel({ selected, onClose }: DetailPanelProps) {
  if (!selected) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto border-t border-slate-800 bg-slate-900/95 backdrop-blur md:right-4 md:top-4 md:bottom-4 md:max-w-md md:rounded-xl md:border md:shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <p className="text-lg font-semibold text-white">{selected.coadd_object_id}</p>
        <button
          onClick={onClose}
          className="rounded-md bg-slate-800 px-2 py-1 text-sm text-slate-100 hover:bg-slate-700"
        >
          Close
        </button>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-800">
          <img
            src={selected.image_url}
            alt={selected.coadd_object_id}
            crossOrigin="anonymous"
            className="h-48 w-full object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-slate-200">
          {Object.entries(selected).map(([key, value]) => (
            <FragmentRow key={key} name={key} value={value} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FragmentRow({ name, value }: { name: string; value: unknown }) {
  return (
    <>
      <div className="text-slate-400">{name}</div>
      <div className="break-words text-slate-100">{String(value)}</div>
    </>
  )
}
