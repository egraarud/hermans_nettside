import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useSports } from '../api/sports'
import { useParticipants } from '../api/participants'
import { useParticipantStats, useSportStats } from '../api/stats'
import { useMe } from '../api/auth'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import champagneImg from '../assets/idretter/champagne.jpg'
import badmintonImg from '../assets/idretter/badminton.jpg'
import bocciaImg from '../assets/idretter/boccia.jpg'
import minigolfImg from '../assets/idretter/minigolf.jpg'
import chessImg from '../assets/idretter/chess.jpg'

const SPORT_IMAGES: Record<string, string> = {
  badminton: badmintonImg,
  boccia: bocciaImg,
  minigolf: minigolfImg,
  sjakk: chessImg,
}

function ParticipantChart({ participantId }: { participantId: number }) {
  const { data: stats, isLoading } = useParticipantStats(participantId)
  if (isLoading) return <LoadingSpinner />
  if (!stats) return null

  const chartData = stats.editions.map(ed => ({
    name: String(ed.year),
    Plassering: ed.overall_rank ?? null,
  }))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="h-36 w-full overflow-hidden">
        <img src={champagneImg} alt="Sammenlagt" className="w-full h-full object-cover" />
      </div>
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Sammenlagtplassering — {stats.participant_name}</h2>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis reversed allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="Plassering" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5, fill: '#f59e0b' }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {stats.editions.map(ed => (
            <div key={ed.edition_id}>
              <p className="text-sm font-medium text-slate-600">{ed.edition_name}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {ed.sports.map(s => (
                  <span key={s.sport_id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {s.sport_name}: {s.score !== null ? s.score : `${s.wins}V/${s.draws}U/${s.losses}T`}
                    {s.rank !== null && ` (nr. ${s.rank})`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SportHistoryChart({ sportId, sportSlug }: { sportId: number; sportSlug: string }) {
  const { data: stats, isLoading } = useSportStats(sportId)
  if (isLoading) return <LoadingSpinner />
  if (!stats?.history.length) return null

  const chartData = stats.history.map(h => ({ year: String(h.year), score: h.best_score }))
  const img = SPORT_IMAGES[sportSlug]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {img && (
        <div className="h-36 w-full overflow-hidden">
          <img src={img} alt={stats.sport_name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">{stats.sport_name} — vinnerscore per år</h2>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5, fill: '#f59e0b' }} name="Beste score" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-3">
          {stats.history.map(h => (
            <span key={h.year} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {h.year}: {h.winner_name ?? '—'} ({h.best_score ?? '—'})
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function StatisticsPage() {
  const [searchParams] = useSearchParams()
  const { data: sports } = useSports()
  const { data: participants } = useParticipants()
  const { data: me } = useMe()
  const fromUrl = searchParams.get('deltaker') ? Number(searchParams.get('deltaker')) : null
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(fromUrl)

  const activeParticipantId = selectedParticipantId ?? me?.participant_id ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Statistikk</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Vis statistikk for:</label>
        <select
          value={activeParticipantId ?? ''}
          onChange={e => setSelectedParticipantId(e.target.value ? Number(e.target.value) : null)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Velg deltaker...</option>
          {participants?.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}{p.id === me?.participant_id ? ' (deg)' : ''}
            </option>
          ))}
        </select>
      </div>

      {activeParticipantId && <ParticipantChart participantId={activeParticipantId} />}

      {sports?.map(s => (
        <SportHistoryChart key={s.id} sportId={s.id} sportSlug={s.slug} />
      ))}
    </div>
  )
}
