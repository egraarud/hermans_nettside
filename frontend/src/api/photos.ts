import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

export interface Photo {
  id: number
  edition_id: number | null
  filename: string
  thumbnail_filename: string | null
  original_name: string | null
  caption: string | null
  uploaded_at: string
}

export const usePhotos = (editionId?: number) =>
  useQuery<Photo[]>({
    queryKey: ['photos', editionId],
    queryFn: () =>
      api.get('/photos', { params: editionId ? { edition_id: editionId } : {} }).then(r => r.data),
  })

export const useUploadPhoto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, caption, editionId }: { file: File; caption?: string; editionId?: number }) => {
      const fd = new FormData()
      fd.append('file', file)
      return api.post('/photos', fd, {
        params: { ...(caption ? { caption } : {}), ...(editionId ? { edition_id: editionId } : {}) },
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
  })
}

export const useDeletePhoto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/photos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
  })
}
