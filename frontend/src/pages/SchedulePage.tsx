import { Link } from 'react-router-dom'
import { useSports } from '../api/sports'
import { useCurrentEdition } from '../hooks/useCurrentEdition'
import { useEditionParticipants } from '../api/participants'
import { useMatches, useResults, useGenerateSchedule } from '../api/results'
import { useMe } from '../api/auth'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import type { Match } from '../api/results'

function MatchRow({
  match,
  nameMap,
  myId,
  isAdmin,
}: {
  match: Match
  nameMap: Record<number, string>
  myId: number | undefined
  isAdmin: boolean
}) {
  const played = match.played_at !== null
  const nameA = nameMap[match.player_a_id] ?? `#${match.player_a_id}`
  const nameB = nameMap[match.player_b_id] ?? `#${match.player_b_id}`
  const isMine = myId === match.player_a_id || myId === match.player_b_id
  const canRegister = !played && (isMine || isAdmin)

  const isDraw = played && match.winner_id === null
  const aWon = played && match.winner_id === match.player_a_id
  const bWon = played && match.winner_id === match.player_b_id

  const nameAClass = isDraw
    ? 'text-yellow-500 font-semibold'
    : aWon
      ? 'text-emerald-600 font-semibold'
      : played
        ? 'text-slate-400'
        : isMine
          ? 'text-slate-800 font-semibold'
          : 'text-slate-700 font-medium'

  const nameBClass = isDraw
    ? 'text-yellow-500 font-semibold'
    : bWon
      ? 'text-emerald-600 font-semibold'
      : played
        ? 'text-slate-400'
        : isMine
          ? 'text-slate-800 font-semibold'
          : 'text-slate-700 font-medium'

  const rowBg = played
    ? 'bg-slate-200/70'
    : isMine
      ? 'bg-amber-50'
      : ''

  return (
    <div className={`px-4 sm:px-5 py-3.5 ${rowBg}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${played ? 'bg-emerald-400' : 'bg-slate-300'}`} />
          <span className="text-sm truncate">
            <span className={nameAClass}>{nameA}</span>
            <span className="text-slate-300 mx-1.5">vs</span>
            <span className={nameBClass}>{nameB}</span>
          </span>
        </div>
        {canRegister && (
          <Link
            to={`/registrer?match=${match.id}`}
            className="shrink-0 text-xs font-semibold text-slate-600 hover:text-amber-600 border border-slate-200 hover:border-amber-300 rounded-lg px-3 py-1.5 transition-colors"
          >
            Registrer →
          </Link>
        )}
      </div>
    </div>
  )
}

export default function SchedulePage() {
  const { edition, isLoading } = useCurrentEdition()
  const { data: sports } = useSports()
  const { data: participants } = useEditionParticipants(edition?.id ?? 0)
  const { data: allMatches } = useMatches(edition?.id ?? 0)
  const { data: allResults } = useResults(edition?.id ?? 0)
  const { data: me } = useMe()
  const generateSchedule = useGenerateSchedule(edition?.id ?? 0)

  if (isLoading) return <LoadingSpinner />

  const isAdmin = me?.role === 'admin'
  const myId = me?.participant_id ?? undefined

  const nameMap: Record<number, string> = {}
  participants?.forEach(p => { nameMap[p.id] = p.name })

  const resultMap: Record<string, boolean> = {}
  allResults?.forEach(r => { resultMap[`${r.sport_id}-${r.participant_id}`] = true })

  const h2hSports = sports?.filter(s => s.match_type === 'head_to_head') ?? []
  const individualSports = sports?.filter(s => s.match_type === 'individual') ?? []

  const matchesBySport: Record<number, Match[]> = {}
  allMatches?.forEach(m => {
    if (!matchesBySport[m.sport_id]) matchesBySport[m.sport_id] = []
    matchesBySport[m.sport_id].push(m)
  })

  const totalH2HMatches = h2hSports.reduce((sum, s) => sum + (matchesBySport[s.id]?.length ?? 0), 0)
  const scheduleGenerated = totalH2HMatches > 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Program</h1>
          {edition && (
            <p className="text-slate-500 text-sm mt-0.5">
              {edition.name}
              {edition.start_date && ` · ${edition.start_date}${edition.end_date ? ` – ${edition.end_date}` : ''}`}
            </p>
          )}
        </div>
        {isAdmin && !scheduleGenerated && (
          <button
            onClick={() => generateSchedule.mutate()}
            disabled={generateSchedule.isPending}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {generateSchedule.isPending ? 'Genererer...' : 'Generer trekkplan'}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Spilt</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" />Ikke spilt</span>
        {myId && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200" />Dine kamper</span>}
      </div>

      {/* H2H sports */}
      {h2hSports.map(sport => {
        const matches = matchesBySport[sport.id] ?? []
        const played = matches.filter(m => m.played_at !== null).length
        return (
          <div key={sport.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">{sport.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Dueller · {played}/{matches.length} spilt</p>
              </div>
              <span className="text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                Duell
              </span>
            </div>
            {matches.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400 text-center">
                {isAdmin ? 'Trykk «Generer trekkplan» for å lage kamper.' : 'Trekkplan ikke generert ennå.'}
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {matches.map(m => (
                  <MatchRow key={m.id} match={m} nameMap={nameMap} myId={myId} isAdmin={isAdmin} />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Individual sports */}
      {individualSports.map(sport => {
        const sortedParticipants = [...(participants ?? [])]
        return (
          <div key={sport.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">{sport.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Individuelt{sport.lower_is_better ? ' · lavest score vinner' : ''} ·{' '}
                  {sortedParticipants.filter(p => resultMap[`${sport.id}-${p.id}`]).length}/{sortedParticipants.length} registrert
                </p>
              </div>
              <span className="text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
                Individuelt
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {sortedParticipants.map(p => {
                const hasResult = resultMap[`${sport.id}-${p.id}`]
                const isMe = p.id === myId
                const canRegister = !hasResult && (isMe || isAdmin)
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 ${isMe && !hasResult ? 'bg-amber-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${hasResult ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      <span className="text-slate-800 font-medium text-sm">{p.name}</span>
                      {hasResult && (
                        <span className="text-xs text-emerald-600 font-medium">Registrert</span>
                      )}
                    </div>
                    {canRegister && (
                      <Link
                        to={`/registrer?sport=${sport.id}&deltaker=${p.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-amber-600 border border-slate-200 hover:border-amber-300 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Registrer →
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {!sports?.length && (
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-10 text-center text-slate-400 text-sm">
          Ingen idretter lagt til ennå.
        </div>
      )}
    </div>
  )
}
