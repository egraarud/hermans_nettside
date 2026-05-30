import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

export interface Participant {
  id: number
  name: string
  nickname: string | null
  created_at: string
}

export const useParticipants = () =>
  useQuery<Participant[]>({ queryKey: ['participants'], queryFn: () => api.get('/participants').then(r => r.data) })

export const useEditionParticipants = (editionId: number) =>
  useQuery<Participant[]>({
    queryKey: ['participants', 'edition', editionId],
    queryFn: () => api.get(`/editions/${editionId}/participants`).then(r => r.data),
  })

export const useCreateParticipant = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; nickname?: string }) => api.post('/participants', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants'] }),
  })
}

export const useAddEditionParticipant = (editionId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participant_id: number) =>
      api.post(`/editions/${editionId}/participants`, { participant_id }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants', 'edition', editionId] }),
  })
}

export const useRemoveEditionParticipant = (editionId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participantId: number) =>
      api.delete(`/editions/${editionId}/participants/${participantId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants', 'edition', editionId] }),
  })
}
