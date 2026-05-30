import { useState } from 'react'
import { usePhotos, useUploadPhoto, useDeletePhoto } from '../../api/photos'
import { useCurrentEdition } from '../../hooks/useCurrentEdition'

export default function AdminPhotosPanel() {
  const { edition } = useCurrentEdition()
  const { data: photos, isLoading } = usePhotos()
  const upload = useUploadPhoto()
  const deletePhoto = useDeletePhoto()
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [feedback, setFeedback] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    try {
      await upload.mutateAsync({ file, caption: caption || undefined, editionId: edition?.id })
      setFile(null)
      setCaption('')
      setFeedback('Bilde lastet opp!')
    } catch {
      setFeedback('Opplasting feilet.')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-semibold text-gray-700">Last opp bilde</h2>
      <form onSubmit={handleUpload} className="bg-white rounded-lg shadow p-5 space-y-3">
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} required
          className="text-sm" />
        <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
          placeholder="Bildetekst (valgfritt)"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        {feedback && <p className="text-sm text-green-700">{feedback}</p>}
        <button type="submit" disabled={upload.isPending}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm disabled:opacity-60">
          {upload.isPending ? 'Laster opp...' : 'Last opp'}
        </button>
      </form>

      <h2 className="font-semibold text-gray-700">Alle bilder</h2>
      {isLoading ? <p className="text-gray-400 text-sm">Laster...</p> : (
        <div className="grid grid-cols-3 gap-2">
          {photos?.map(p => (
            <div key={p.id} className="relative group">
              <img
                src={`/static/uploads/${p.thumbnail_filename ?? p.filename}`}
                alt={p.caption ?? ''}
                className="w-full aspect-square object-cover rounded"
              />
              <button
                onClick={() => deletePhoto.mutate(p.id)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
              >
                Slett
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
