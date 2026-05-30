import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

export interface Result {
  id: number
  edition_id: number
  sport_id: number
  participant_id: number
  score: number
  notes: string | null
  recorded_at: string
}

export interface Match {
  id: number
  edition_id: number
  sport_id: number
  player_a_id: number
  player_b_id: number
  score_a: string | null
  score_b: string | null
  winner_id: number | null
  played_at: string | null
  notes: string | null
}

export const useResults = (editionId: number, sportId?: number) =>
  useQuery<Result[]>({
    queryKey: ['results', editionId, sportId],
    queryFn: () =>
      api.get(`/editions/${editionId}/results`, { params: sportId ? { sport_id: sportId } : {} }).then(r => r.data),
  })

export const useMatches = (editionId: number, sportId?: number) =>
  useQuery<Match[]>({
    queryKey: ['matches', editionId, sportId],
    queryFn: () =>
      api.get(`/editions/${editionId}/matches`, { params: sportId ? { sport_id: sportId } : {} }).then(r => r.data),
  })

export const useSubmitResult = (editionId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { sport_id: number; participant_id: number; score: number; notes?: string }) =>
      api.post(`/editions/${editionId}/results`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['results', editionId] })
      qc.invalidateQueries({ queryKey: ['leaderboard', editionId] })
    },
  })
}

export const useSubmitMatch = (editionId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      sport_id: number
      player_a_id: number
      player_b_id: number
      score_a?: string
      score_b?: string
      winner_id?: number | null
      notes?: string
    }) => api.post(`/editions/${editionId}/matches`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches', editionId] })
      qc.invalidateQueries({ queryKey: ['leaderboard', editionId] })
    },
  })
}

export const useUpdateMatch = (editionId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ matchId, body }: {
      matchId: number
      body: { score_a?: string; score_b?: string; winner_id?: number | null; notes?: string }
    }) => api.patch(`/editions/${editionId}/matches/${matchId}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches', editionId] })
      qc.invalidateQueries({ queryKey: ['leaderboard', editionId] })
    },
  })
}

export const useMatch = (editionId: number, matchId: number | undefined) =>
  useQuery<Match>({
    queryKey: ['match', editionId, matchId],
    queryFn: () => api.get(`/editions/${editionId}/matches/${matchId}`).then(r => r.data),
    enabled: !!editionId && !!matchId,
  })

export const useGenerateSchedule = (editionId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/editions/${editionId}/matches/schedule/generate`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches', editionId] }),
  })
}

export const useDeleteResult = (editionId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (resultId: number) => api.delete(`/editions/${editionId}/results/${resultId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['results', editionId] }),
  })
}
