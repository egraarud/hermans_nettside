import { useState } from 'react'
import { useEditions, useCreateEdition } from '../../api/editions'

export default function AdminEditionsPanel() {
  const { data: editions } = useEditions()
  const create = useCreateEdition()
  const [year, setYear] = useState('')
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({
        year: Number(year),
        name,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setYear(''); setName(''); setStartDate(''); setEndDate('')
      setFeedback('Utgave opprettet!')
    } catch (err: any) {
      setFeedback(err?.response?.data?.detail ?? 'Feil')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-semibold text-gray-700">Ny turnerings-utgave</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">År</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} required min="2000" max="2100"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="2025" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Navn</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Hermans Turnering 2025" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Startdato (valgfritt)</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sluttdato (valgfritt)</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
          </div>
        </div>
        {feedback && <p className="text-sm text-green-700">{feedback}</p>}
        <button type="submit" disabled={create.isPending}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm disabled:opacity-60">
          Opprett
        </button>
      </form>

      <h2 className="font-semibold text-gray-700">Alle utgaver</h2>
      <div className="space-y-2">
        {editions?.map(ed => (
          <div key={ed.id} className="bg-white rounded shadow px-4 py-2 text-sm flex justify-between items-center">
            <span><strong>{ed.year}</strong> — {ed.name}</span>
            {ed.start_date && <span className="text-gray-400 text-xs">{ed.start_date}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
