import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

export interface Sport {
  id: number
  slug: string
  name: string
  description: string | null
  match_type: 'individual' | 'head_to_head'
  scoring_type: string
  lower_is_better: boolean
  created_at: string
}

export const useSports = () =>
  useQuery<Sport[]>({ queryKey: ['sports'], queryFn: () => api.get('/sports').then(r => r.data) })

export const useCreateSport = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Sport, 'id' | 'created_at'>) => api.post('/sports', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sports'] }),
  })
}

export const useUpdateSport = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Sport>) => api.patch(`/sports/${id}`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sports'] }),
  })
}
