import { useParams } from 'react-router-dom'
import { useEdition } from '../api/editions'
import { useSports } from '../api/sports'
import { useLeaderboard } from '../api/leaderboard'
import { useMe } from '../api/auth'
import LeaderboardTable from '../components/leaderboard/LeaderboardTable'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useState } from 'react'

export default function EditionDetailPage() {
  const { id } = useParams()
  const editionId = Number(id)
  const { data: edition, isLoading } = useEdition(editionId)
  const { data: sports } = useSports()
  const { data: me } = useMe()
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>()
  const { data: lb } = useLeaderboard(editionId, selectedSportId)

  if (isLoading) return <LoadingSpinner />
  if (!edition) return <p className="text-gray-500">Utgave ikke funnet.</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{edition.name}</h1>
        {edition.start_date && (
          <p className="text-gray-500 text-sm mt-1">
            {edition.start_date}{edition.end_date ? ` – ${edition.end_date}` : ''}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedSportId(undefined)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            !selectedSportId ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sammenlagt
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

      {lb && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">{lb.sport_name ?? 'Sammenlagt'}</h2>
          </div>
          <LeaderboardTable lb={lb} highlightParticipantId={me?.participant_id ?? undefined} />
        </div>
      )}
    </div>
  )
}
