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
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
          <th className="px-4 py-3">Deltaker</th>
          <th className="px-4 py-3 text-right">Resultat</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {participants.map(p => (
          <tr
            key={p.id}
            className={p.id === myParticipantId ? 'bg-amber-50' : ''}
          >
            <td className="px-4 py-3 text-slate-800 font-medium">
              {p.name}
              {p.id === myParticipantId && (
                <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">deg</span>
              )}
            </td>
            <td className="px-4 py-3 text-right font-mono text-slate-700">
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
    return <p className="text-slate-400 px-4 py-6 text-sm">Ingen kamper registrert ennå.</p>
  }

  const rowBg = (m: typeof matches[number]) => {
    if (!myParticipantId) return ''
    const isMyMatch = m.player_a_id === myParticipantId || m.player_b_id === myParticipantId
    if (!isMyMatch) return ''
    if (m.played_at === null) return 'bg-blue-50'
    if (m.winner_id === null) return 'bg-yellow-50'
    if (m.winner_id === myParticipantId) return 'bg-emerald-50'
    return 'bg-red-50'
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
          <th className="px-4 py-3">Spiller A</th>
          <th className="px-3 py-3 text-center">Resultat</th>
          <th className="px-4 py-3 text-right">Spiller B</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {matches.map(m => (
          <tr key={m.id} className={rowBg(m)}>
            <td className={`px-4 py-3 font-medium ${
              m.winner_id === m.player_a_id ? 'text-emerald-600' :
              m.played_at && m.winner_id !== null ? 'text-slate-400' :
              'text-slate-800'
            }`}>
              {nameMap[m.player_a_id] ?? '?'}
            </td>
            <td className="px-3 py-3 text-center font-mono text-slate-500 text-xs">
              {m.score_a && m.score_b ? `${m.score_a} – ${m.score_b}` : '—'}
            </td>
            <td className={`px-4 py-3 text-right font-medium ${
              m.winner_id === m.player_b_id ? 'text-emerald-600' :
              m.played_at && m.winner_id !== null ? 'text-slate-400' :
              'text-slate-800'
            }`}>
              {nameMap[m.player_b_id] ?? '?'}
            </td>
          </tr>
        ))}
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
  if (!edition) return <p className="text-slate-500">Ingen turnering funnet.</p>

  const activeSports = selectedSportId ? sports?.filter(s => s.id === selectedSportId) : sports

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
    }`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Resultater</h1>
        <p className="text-slate-500 text-sm mt-0.5">{edition.name}</p>
      </div>

      {/* Sport filter tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl w-max sm:w-fit">
          <button onClick={() => setSelectedSportId(undefined)} className={tabClass(!selectedSportId)}>
            Alle
          </button>
          {sports?.map(s => (
            <button key={s.id} onClick={() => setSelectedSportId(s.id)} className={tabClass(selectedSportId === s.id)}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {activeSports?.map(sport => (
        <div key={sport.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <h2 className="font-semibold text-slate-800">{sport.name}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              sport.match_type === 'head_to_head'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
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
