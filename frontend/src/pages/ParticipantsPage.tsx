import { useParticipants } from '../api/participants'
import { useCurrentEdition } from '../hooks/useCurrentEdition'
import { useLeaderboard } from '../api/leaderboard'
import { useMe } from '../api/auth'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const INITIALS = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

export default function ParticipantsPage() {
  const { data: participants, isLoading } = useParticipants()
  const { edition } = useCurrentEdition()
  const { data: lb } = useLeaderboard(edition?.id ?? 0)
  const { data: me } = useMe()

  if (isLoading) return <LoadingSpinner />

  const rankMap: Record<number, number> = {}
  const pointsMap: Record<number, number> = {}
  lb?.entries.forEach(e => {
    rankMap[e.participant_id] = e.rank
    pointsMap[e.participant_id] = e.total_points ?? 0
  })

  const sorted = [...(participants ?? [])].sort((a, b) => (rankMap[a.id] ?? 999) - (rankMap[b.id] ?? 999))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Deltakere</h1>
        <p className="text-slate-500 text-sm mt-0.5">{sorted.length} påmeldte</p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sorted.map((p, i) => {
          const rank = rankMap[p.id]
          const points = pointsMap[p.id]
          const isMe = p.id === me?.participant_id
          const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length]

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-md ${
                isMe ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${colorClass}`}>
                  {INITIALS(p.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                    {isMe && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
                        deg
                      </span>
                    )}
                  </div>
                  {p.nickname && (
                    <div className="text-sm text-slate-400 italic">"{p.nickname}"</div>
                  )}
                  {rank !== undefined ? (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-lg">{MEDAL[rank] ?? `#${rank}`}</span>
                      <span className="text-slate-500">{points} poeng</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-400">Ingen resultater ennå</div>
                  )}
                </div>
              </div>

              <Link
                to={`/statistikk?deltaker=${p.id}`}
                className="mt-4 block text-center text-xs font-semibold text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-300 rounded-lg py-2 transition-colors"
              >
                Se statistikk →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
