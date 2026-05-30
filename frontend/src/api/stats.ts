import { useQuery } from '@tanstack/react-query'
import api from './client'

export interface EditionStats {
  edition_id: number
  edition_name: string
  participant_count: number
  sport_count: number
  result_count: number
  match_count: number
}

export interface SportHistoryEntry {
  year: number
  edition_name: string
  winner_name: string | null
  best_score: number | null
}

export interface SportStats {
  sport_id: number
  sport_name: string
  history: SportHistoryEntry[]
}

export interface ParticipantSportStat {
  sport_id: number
  sport_name: string
  score: number | null
  rank: number | null
  wins: number | null
  losses: number | null
  draws: number | null
}

export interface ParticipantEditionStats {
  edition_id: number
  edition_name: string
  year: number
  sports: ParticipantSportStat[]
  overall_rank: number | null
}

export interface ParticipantStats {
  participant_id: number
  participant_name: string
  editions: ParticipantEditionStats[]
}

export const useEditionStats = (editionId: number) =>
  useQuery<EditionStats>({
    queryKey: ['stats', 'edition', editionId],
    queryFn: () => api.get(`/stats/edition/${editionId}`).then(r => r.data),
    enabled: !!editionId,
  })

export const useSportStats = (sportId: number) =>
  useQuery<SportStats>({
    queryKey: ['stats', 'sport', sportId],
    queryFn: () => api.get(`/stats/sport/${sportId}`).then(r => r.data),
    enabled: !!sportId,
  })

export const useParticipantStats = (participantId: number) =>
  useQuery<ParticipantStats>({
    queryKey: ['stats', 'participant', participantId],
    queryFn: () => api.get(`/stats/participant/${participantId}`).then(r => r.data),
    enabled: !!participantId,
  })
