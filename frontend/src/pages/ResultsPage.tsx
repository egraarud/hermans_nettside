import { useState } from 'react'
import { useCurrentEdition } from '../hooks/useCurrentEdition'
import { useSports } from '../api/sports'
import { useResults, useMatches } from '../api/results'
import { useEditionParticipants } from '../api/participants'
import { useMe } from '../api/auth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function IndividualResultsGrid({
  editionId,
  sportId,
  myParticipantId,
}: {
  editionId: number
  sportId: number
  myParticipantId?: number
}) {
  const { data: results } = useResults(editionId, sportId)
  const { data: participants } = useEditionParticipants(editionId)
  if (!results || !participants) return <LoadingSpinner />

  const scoreMap: Record<number, number> = {}
  results.forEach(r => (scoreMap[r.participant_id] = r.score))

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-50 text-gray-600">
          <th className="px-3 py-2 text-left">Deltaker</th>
          <th className="px-3 py-2 text-right">Resultat</th>
        </tr>
      </thead>
      <tbody>
        {participants.map(p => (
          <tr
            key={p.id}
            className={`border-b border-gray-100 ${p.id === myParticipantId ? 'bg-green-50 font-semibold' : ''}`}
          >
            <td className="px-3 py-2">{p.name}</td>
            <td className="px-3 py-2 text-right font-mono">
              {scoreMap[p.id] !== undefined ? scoreMap[p.id] : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MatchResultsList({
  editionId,
  sportId,
  myParticipantId,
}: {
  editionId: number
  sportId: number
  myParticipantId?: number
}) {
  const { data: matches } = useMatches(editionId, sportId)
  const { data: participants } = useEditionParticipants(editionId)
  if (!matches || !participants) return <LoadingSpinner />

  const nameMap: Record<number, string> = {}
  participants.forEach(p => (nameMap[p.id] = p.name))

  if (matches.length === 0) {
    return <p className="text-gray-400 px-3 py-4 text-sm">Ingen kamper registrert ennå.</p>
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-50 text-gray-600">
          <th className="px-3 py-2 text-left">Spiller A</th>
          <th className="px-3 py-2 text-center">Resultat</th>
          <th className="px-3 py-2 text-right">Spiller B</th>
          <th className="px-3 py-2 text-right">Vinner</th>
        </tr>
      </thead>
      <tbody>
        {matches.map(m => {
          const isMyMatch = m.player_a_id === myParticipantId || m.player_b_id === myParticipantId
          return (
            <tr key={m.id} className={`border-b border-gray-100 ${isMyMatch ? 'bg-green-50' : ''}`}>
              <td className="px-3 py-2">{nameMap[m.player_a_id] ?? '?'}</td>
              <td className="px-3 py-2 text-center font-mono">
                {m.score_a && m.score_b ? `${m.score_a} – ${m.score_b}` : '—'}
              </td>
              <td className="px-3 py-2 text-right">{nameMap[m.player_b_id] ?? '?'}</td>
              <td className="px-3 py-2 text-right text-green-700 font-medium">
                {m.winner_id ? nameMap[m.winner_id] : 'Uavgjort'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function ResultsPage() {
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>()
  const { edition, isLoading } = useCurrentEdition()
  const { data: sports } = useSports()
  const { data: me } = useMe()

  if (isLoading) return <LoadingSpinner />
  if (!edition) return <p className="text-gray-500">Ingen turnering funnet.</p>

  const activeSports = selectedSportId ? sports?.filter(s => s.id === selectedSportId) : sports

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Resultater — {edition.name}</h1>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedSportId(undefined)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            !selectedSportId ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Alle
        </button>
        {sports?.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSportId(s.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              selectedSportId === s.id ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {activeSports?.map(sport => (
        <div key={sport.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <h2 className="font-semibold text-gray-700">{sport.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              sport.match_type === 'head_to_head' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {sport.match_type === 'head_to_head' ? 'Dueller' : 'Individuelt'}
            </span>
          </div>
          {sport.match_type === 'individual' ? (
            <IndividualResultsGrid
              editionId={edition.id}
              sportId={sport.id}
              myParticipantId={me?.participant_id ?? undefined}
            />
          ) : (
            <MatchResultsList
              editionId={edition.id}
              sportId={sport.id}
              myParticipantId={me?.participant_id ?? undefined}
            />
          )}
        </div>
      ))}
    </div>
  )
}
