import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCurrentEdition } from '../hooks/useCurrentEdition'
import { useLeaderboard } from '../api/leaderboard'
import { useSports } from '../api/sports'
import { useMe } from '../api/auth'
import LeaderboardTable from '../components/leaderboard/LeaderboardTable'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function LeaderboardPage() {
  const [searchParams] = useSearchParams()
  const initialSport = searchParams.get('sport') ? Number(searchParams.get('sport')) : undefined
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>(initialSport)
  const { edition, isLoading: editionLoading } = useCurrentEdition()
  const { data: sports } = useSports()
  const { data: lb, isLoading: lbLoading } = useLeaderboard(edition?.id ?? 0, selectedSportId)
  const { data: me } = useMe()

  if (editionLoading) return <LoadingSpinner />
  if (!edition) return <p className="text-slate-500">Ingen turnering funnet.</p>

  const tabClass = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
    }`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Resultattavle</h1>
        <p className="text-slate-500 text-sm mt-0.5">{edition.name}</p>
      </div>

      {/* Sport tabs */}
      <div className="flex gap-1.5 flex-wrap bg-slate-200/60 p-1 rounded-xl w-fit">
        <button onClick={() => setSelectedSportId(undefined)} className={tabClass(!selectedSportId)}>
          Sammenlagt
        </button>
        {sports?.map(s => (
          <button key={s.id} onClick={() => setSelectedSportId(s.id)} className={tabClass(selectedSportId === s.id)}>
            {s.name}
          </button>
        ))}
      </div>

      {lbLoading ? (
        <LoadingSpinner />
      ) : lb ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <h2 className="font-semibold text-slate-800">{lb.sport_name ?? 'Sammenlagt'}</h2>
            {lb.match_type === 'head_to_head' && (
              <span className="text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                Dueller
              </span>
            )}
          </div>
          <LeaderboardTable lb={lb} highlightParticipantId={me?.participant_id ?? undefined} />
        </div>
      ) : null}
    </div>
  )
}
