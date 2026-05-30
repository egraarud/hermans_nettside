import { useState } from 'react'
import { useMe } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import AdminUsersPanel from '../components/admin/AdminUsersPanel'
import AdminSportsPanel from '../components/admin/AdminSportsPanel'
import AdminParticipantsPanel from '../components/admin/AdminParticipantsPanel'
import AdminEditionsPanel from '../components/admin/AdminEditionsPanel'
import AdminScorePanel from '../components/admin/AdminScorePanel'
import AdminPhotosPanel from '../components/admin/AdminPhotosPanel'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const TABS = [
  { id: 'score', label: 'Resultater' },
  { id: 'photos', label: 'Bilder' },
  { id: 'participants', label: 'Deltakere' },
  { id: 'sports', label: 'Idretter' },
  { id: 'editions', label: 'Utgaver' },
  { id: 'users', label: 'Brukere' },
]

export default function AdminPage() {
  const { data: me, isLoading } = useMe()
  const navigate = useNavigate()
  const [tab, setTab] = useState('score')

  if (isLoading) return <LoadingSpinner />
  if (!me) { navigate('/logg-inn'); return null }
  if (me.role !== 'admin') {
    return <p className="text-red-600">Du har ikke tilgang til admin-siden.</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Administrasjon</h1>
      <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              tab === t.id ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'score' && <AdminScorePanel />}
      {tab === 'photos' && <AdminPhotosPanel />}
      {tab === 'participants' && <AdminParticipantsPanel />}
      {tab === 'sports' && <AdminSportsPanel />}
      {tab === 'editions' && <AdminEditionsPanel />}
      {tab === 'users' && <AdminUsersPanel />}
    </div>
  )
}
