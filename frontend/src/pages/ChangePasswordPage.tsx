import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChangePassword, useMe } from '../api/auth'
import { useQueryClient } from '@tanstack/react-query'

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const changePassword = useChangePassword()
  const { data: me } = useMe()
  const qc = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (next !== confirm) {
      setError('De nye passordene stemmer ikke overens')
      return
    }
    if (next.length < 6) {
      setError('Passord må være minst 6 tegn')
      return
    }
    try {
      await changePassword.mutateAsync({ current_password: current, new_password: next })
      setSuccess(true)
      qc.invalidateQueries({ queryKey: ['me'] })
      setTimeout(() => navigate('/'), 1500)
    } catch {
      setError('Feil nåværende passord')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-2">Bytt passord</h1>
      {me?.must_change_password && (
        <p className="text-center text-amber-600 text-sm mb-4">
          Du må bytte passord før du kan fortsette.
        </p>
      )}
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-center">
          Passord byttet! Omdirigerer...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nåværende passord</label>
            <input
              type="password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nytt passord</label>
            <input
              type="password"
              value={next}
              onChange={e => setNext(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bekreft nytt passord</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded transition"
          >
            {changePassword.isPending ? 'Lagrer...' : 'Bytt passord'}
          </button>
        </form>
      )}
    </div>
  )
}
