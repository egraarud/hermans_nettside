import { useSports } from '../api/sports'
import { useCurrentEdition } from '../hooks/useCurrentEdition'
import { useLeaderboard } from '../api/leaderboard'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import minigolfImg from '../assets/idretter/minigolf.jpg'
import bocciaImg from '../assets/idretter/boccia.jpg'
import badmintonImg from '../assets/idretter/badminton.jpg'
import chessImg from '../assets/idretter/chess.jpg'

const SPORT_IMAGES: Record<string, string> = {
  minigolf: minigolfImg,
  boccia: bocciaImg,
  badminton: badmintonImg,
  sjakk: chessImg,
}

const SPORT_ICONS: Record<string, string> = {
  minigolf: '⛳',
  boccia: '🎳',
  sjakk: '♟️',
  badminton: '🏸',
}

const SCORING_LABELS: Record<string, string> = {
  strokes: 'slag',
  points: 'poeng',
  wins: 'seiere',
  time: 'tid',
}

function SportLeaderboardPreview({ editionId, sportId }: { editionId: number; sportId: number }) {
  const { data: lb } = useLeaderboard(editionId, sportId)
  if (!lb?.entries.length) {
    return <p className="text-sm text-slate-400 mt-3">Ingen resultater ennå.</p>
  }
  const top3 = lb.entries.slice(0, 3)
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="mt-4 space-y-1.5">
      {top3.map((e, i) => (
        <div key={e.participant_id} className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span>{medals[i]}</span>
            <span className="text-slate-700 font-medium">{e.participant_name}</span>
          </span>
          <span className="text-slate-400 font-mono text-xs">
            {lb.match_type === 'individual'
              ? e.score
              : `${e.wins ?? 0}V / ${e.draws ?? 0}U / ${e.losses ?? 0}T`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SportsPage() {
  const { data: sports, isLoading } = useSports()
  const { edition } = useCurrentEdition()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Idretter</h1>
        <p className="text-slate-500 text-sm mt-0.5">{sports?.length ?? 0} øvelser i turneringen</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {sports?.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Sport image header */}
            {SPORT_IMAGES[s.slug] ? (
              <div className="h-44 overflow-hidden">
                <img
                  src={SPORT_IMAGES[s.slug]}
                  alt={s.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-44 bg-slate-100 flex items-center justify-center text-5xl">
                {SPORT_ICONS[s.slug] ?? '🏅'}
              </div>
            )}

            {/* Card body */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-bold text-slate-800 text-lg leading-tight">{s.name}</h2>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  s.match_type === 'head_to_head'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {s.match_type === 'head_to_head' ? 'Dueller' : 'Individuelt'}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                  {SCORING_LABELS[s.scoring_type] ?? s.scoring_type}
                  {s.lower_is_better ? ' · lavest vinner' : ''}
                </span>
              </div>

              {s.description && (
                <p className="text-sm text-slate-500 mb-3">{s.description}</p>
              )}

              {edition && <SportLeaderboardPreview editionId={edition.id} sportId={s.id} />}

              <Link
                to={`/resultattavle?sport=${s.id}`}
                className="mt-4 block text-center text-xs font-semibold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-300 rounded-lg py-2 transition-colors"
              >
                Full tabell →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
