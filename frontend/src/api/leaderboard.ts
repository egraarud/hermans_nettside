import { useQuery } from '@tanstack/react-query'
import api from './client'

export interface LeaderboardEntry {
  rank: number
  participant_id: number
  participant_name: string
  score?: number
  wins?: number
  draws?: number
  losses?: number
  points?: number
  total_points?: number
}

export interface Leaderboard {
  edition_id: number
  sport_id: number | null
  sport_name: string | null
  match_type: 'individual' | 'head_to_head' | 'overall' | null
  entries: LeaderboardEntry[]
}

export const useLeaderboard = (editionId: number, sportId?: number) =>
  useQuery<Leaderboard>({
    queryKey: ['leaderboard', editionId, sportId],
    queryFn: () =>
      api.get(`/editions/${editionId}/leaderboard`, { params: sportId ? { sport_id: sportId } : {} }).then(r => r.data),
    enabled: !!editionId,
  })

export const useAlltimeLeaderboard = () =>
  useQuery<Leaderboard[]>({
    queryKey: ['leaderboard', 'alltime'],
    queryFn: () => api.get('/leaderboard/alltime').then(r => r.data),
  })
