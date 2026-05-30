import { useState } from 'react'
import { usePhotos } from '../api/photos'
import { useCurrentEdition } from '../hooks/useCurrentEdition'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function Lightbox({ src, caption, onClose }: { src: string; caption?: string | null; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img src={src} alt={caption ?? ''} className="w-full rounded-lg max-h-[80vh] object-contain" />
        {caption && <p className="text-white text-center mt-3 text-sm">{caption}</p>}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function PhotosPage() {
  const { edition } = useCurrentEdition()
  const { data: photos, isLoading } = usePhotos(edition?.id)
  const [lightbox, setLightbox] = useState<{ src: string; caption?: string | null } | null>(null)

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Bilder</h1>
      {!photos?.length && (
        <p className="text-gray-400">Ingen bilder lastet opp ennå.</p>
      )}
      <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
        {photos?.map(photo => {
          const thumb = photo.thumbnail_filename
            ? `/static/uploads/${photo.thumbnail_filename}`
            : `/static/uploads/${photo.filename}`
          const full = `/static/uploads/${photo.filename}`
          return (
            <div
              key={photo.id}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => setLightbox({ src: full, caption: photo.caption })}
            >
              <img
                src={thumb}
                alt={photo.caption ?? ''}
                className="w-full rounded-lg object-cover group-hover:opacity-90 transition"
                loading="lazy"
              />
              {photo.caption && (
                <p className="text-xs text-gray-500 mt-1 px-1">{photo.caption}</p>
              )}
            </div>
          )
        })}
      </div>
      {lightbox && (
        <Lightbox src={lightbox.src} caption={lightbox.caption} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
