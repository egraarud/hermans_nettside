export default function LoadingSpinner({ text = 'Laster...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
