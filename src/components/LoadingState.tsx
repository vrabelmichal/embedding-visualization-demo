export function LoadingState({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-slate-200">
      <span className="h-3 w-3 animate-ping rounded-full bg-indigo-400" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
