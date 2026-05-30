import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useSports } from '../api/sports'
import { useParticipants } from '../api/participants'
import { useParticipantStats, useSportStats } from '../api/stats'
import { useMe } from '../api/auth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function ParticipantChart({ participantId }: { participantId: number }) {
  const { data: stats, isLoading } = useParticipantStats(participantId)
  if (isLoading) return <LoadingSpinner />
  if (!stats) return null

  const chartData = stats.editions.map(ed => ({
    name: String(ed.year),
    Plassering: ed.overall_rank ?? null,
  }))

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-700 mb-4">
        Sammenlagtplassering — {stats.participant_name}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis reversed allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="Plassering" stroke="#15803d" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {stats.editions.map(ed => (
          <div key={ed.edition_id}>
            <p className="text-sm font-medium text-gray-600">{ed.edition_name}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {ed.sports.map(s => (
                <span key={s.sport_id} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {s.sport_name}: {s.score !== null ? s.score : `${s.wins}V/${s.draws}U/${s.losses}T`}
                  {s.rank !== null && ` (nr. ${s.rank})`}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SportHistoryChart({ sportId }: { sportId: number }) {
  const { data: stats, isLoading } = useSportStats(sportId)
  if (isLoading) return <LoadingSpinner />
  if (!stats?.history.length) return null

  const chartData = stats.history.map(h => ({ year: String(h.year), score: h.best_score }))

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-700 mb-1">{stats.sport_name} — vinnerscore per år</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" fill="#15803d" name="Beste score" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-gray-500">
        {stats.history.map(h => (
          <span key={h.year} className="mr-4">
            {h.year}: {h.winner_name ?? '—'} ({h.best_score ?? '—'})
          </span>
        ))}
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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Statistikk</h1>

      {/* Participant selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vis statistikk for:</label>
        <select
          value={activeParticipantId ?? ''}
          onChange={e => setSelectedParticipantId(e.target.value ? Number(e.target.value) : null)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
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

      {sports?.map(s => <SportHistoryChart key={s.id} sportId={s.id} />)}
    </div>
  )
}
