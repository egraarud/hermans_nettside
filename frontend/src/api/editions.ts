import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

export interface Edition {
  id: number
  year: number
  name: string
  start_date: string | null
  end_date: string | null
  created_at: string
}

export const useEditions = () =>
  useQuery<Edition[]>({ queryKey: ['editions'], queryFn: () => api.get('/editions').then(r => r.data) })

export const useEdition = (id: number) =>
  useQuery<Edition>({ queryKey: ['edition', id], queryFn: () => api.get(`/editions/${id}`).then(r => r.data) })

export const useCreateEdition = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { year: number; name: string; start_date?: string; end_date?: string }) =>
      api.post('/editions', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['editions'] }),
  })
}

export const useUpdateEdition = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Edition>) => api.patch(`/editions/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['editions'] })
      qc.invalidateQueries({ queryKey: ['edition', id] })
    },
  })
}
