import { useState } from 'react'
import { useAdminUsers, useCreateAdminUser, useDeleteAdminUser, useResetPassword } from '../../api/auth'
import { useParticipants } from '../../api/participants'

export default function AdminUsersPanel() {
  const { data: users } = useAdminUsers()
  const { data: participants } = useParticipants()
  const create = useCreateAdminUser()
  const deleteUser = useDeleteAdminUser()
  const resetPassword = useResetPassword()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('participant')
  const [participantId, setParticipantId] = useState('')
  const [feedback, setFeedback] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({
        username,
        email,
        role,
        participant_id: participantId ? Number(participantId) : undefined,
      })
      setUsername(''); setEmail(''); setRole('participant'); setParticipantId('')
      setFeedback('Bruker opprettet! Midlertidig passord er sendt på e-post (eller logget i konsollet).')
    } catch (err: any) {
      setFeedback(err?.response?.data?.detail ?? 'Feil')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-semibold text-gray-700">Ny bruker</h2>
      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Brukernavn</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">E-post</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rolle</label>
          <select value={role} onChange={e => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
            <option value="participant">Deltaker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {role === 'participant' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Koble til deltaker</label>
            <select value={participantId} onChange={e => setParticipantId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
              <option value="">Ingen kobling</option>
              {participants?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        {feedback && <p className="text-sm text-green-700">{feedback}</p>}
        <button type="submit" disabled={create.isPending}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm disabled:opacity-60">
          Opprett og send passord
        </button>
      </form>

      <h2 className="font-semibold text-gray-700">Brukere</h2>
      <div className="space-y-2">
        {users?.map(u => (
          <div key={u.id} className="bg-white rounded shadow px-4 py-2 text-sm flex items-center justify-between gap-2">
            <div>
              <span className="font-medium">{u.username}</span>
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                {u.role}
              </span>
              {u.must_change_password && (
                <span className="ml-1 text-xs text-amber-600">(midlertidig passord)</span>
              )}
              <div className="text-gray-400 text-xs">{u.email}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => resetPassword.mutate(u.id)}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded">
                Tilbakestill
              </button>
              <button onClick={() => { if (confirm(`Slett ${u.username}?`)) deleteUser.mutate(u.id) }}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded">
                Slett
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
