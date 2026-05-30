import { Link } from 'react-router-dom'
import { useCurrentEdition } from '../hooks/useCurrentEdition'
import { useMe } from '../api/auth'
import { useLeaderboard } from '../api/leaderboard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import oymarksjoen from '../assets/oymarksjoen.jpeg'

function NavCard({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      className="group bg-white/80 rounded-xl border border-slate-200 py-6 px-4 flex items-center justify-center hover:border-amber-400 hover:bg-white hover:shadow-md transition-all"
    >
      <span className="font-semibold text-slate-700 group-hover:text-amber-600 transition-colors text-center">
        {label}
      </span>
    </Link>
  )
}

export default function HomePage() {
  const { edition, isLoading } = useCurrentEdition()
  const { data: me } = useMe()
  const { data: lb } = useLeaderboard(edition?.id ?? 0)

  const myRank = lb?.entries.find(e => e.participant_id === me?.participant_id)

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      {edition ? (
        <>
          {/* Hero */}
          <div
            className="relative bg-slate-900 rounded-2xl overflow-hidden px-8 py-16 text-center shadow-xl"
            style={{ backgroundImage: `url(${oymarksjoen})`, backgroundSize: 'cover', backgroundPosition: 'center 60%' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/80 to-slate-900/90" />
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #f59e0b 0%, transparent 60%)' }} />
            <div className="relative">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">
                Turnering
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {edition.name}
              </h1>
              {edition.start_date && (
                <p className="text-slate-400 mt-2 text-sm">
                  {edition.start_date}{edition.end_date ? ` – ${edition.end_date}` : ''}
                </p>
              )}
              <div className="mt-6 flex gap-3 justify-center flex-wrap">
                <Link
                  to="/resultattavle"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow"
                >
                  Se resultattavle
                </Link>
                <Link
                  to="/program"
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Program
                </Link>
              </div>
            </div>
          </div>

          {/* My rank banner */}
          {me && myRank && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-amber-900 text-sm">Dine resultater</p>
                <p className="text-amber-800 mt-0.5">
                  Du er på <strong>plass {myRank.rank}</strong> i sammenlagtledertavlen
                  med <strong>{myRank.total_points} poeng</strong>.
                </p>
              </div>
              <Link
                to="/statistikk"
                className="shrink-0 text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
              >
                Se statistikk →
              </Link>
            </div>
          )}

          {/* Primary nav buttons */}
          <div className="grid grid-cols-3 gap-4">
            <NavCard label="Deltakere"  to="/deltakere" />
            <NavCard label="Idretter"   to="/idretter" />
            <NavCard label="Resultater" to="/resultater" />
          </div>

          {/* Secondary nav buttons */}
          <div className="grid grid-cols-2 gap-4">
            <NavCard label="Resultattavle" to="/resultattavle" />
            <NavCard label="Program"       to="/program" />
          </div>
        </>
      ) : (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold text-slate-700 mb-2">Øiestad Open Invitational Qualifiers</h1>
          <p className="text-slate-400">Ingen turnering er registrert ennå.</p>
        </div>
      )}
    </div>
  )
}
