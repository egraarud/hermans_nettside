import { useState } from 'react'
import { useSports, useCreateSport } from '../../api/sports'

export default function AdminSportsPanel() {
  const { data: sports } = useSports()
  const create = useCreateSport()
  const [form, setForm] = useState({
    slug: '', name: '', description: '', match_type: 'individual', scoring_type: 'points', lower_is_better: false,
  })
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({
        ...form,
        description: form.description || null,
        match_type: form.match_type as 'individual' | 'head_to_head',
      })
      setForm({ slug: '', name: '', description: '', match_type: 'individual', scoring_type: 'points', lower_is_better: false })
      setFeedback('Idrett opprettet!')
    } catch (err: any) {
      setFeedback(err?.response?.data?.detail ?? 'Feil')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-semibold text-gray-700">Legg til idrett</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slug (unik ID)</label>
            <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="minigolf" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Navn</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Minigolf" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select value={form.match_type} onChange={e => setForm(f => ({ ...f, match_type: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
            <option value="individual">Individuelt (én score per person)</option>
            <option value="head_to_head">Dueller</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Scoretype</label>
          <select value={form.scoring_type} onChange={e => setForm(f => ({ ...f, scoring_type: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
            <option value="points">Poeng</option>
            <option value="strokes">Slag (minigolf)</option>
            <option value="time">Tid</option>
            <option value="wins">Seiere</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.lower_is_better}
            onChange={e => setForm(f => ({ ...f, lower_is_better: e.target.checked }))} />
          Lavest score vinner (f.eks. minigolf)
        </label>
        {feedback && <p className="text-sm text-green-700">{feedback}</p>}
        <button type="submit" disabled={create.isPending}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm disabled:opacity-60">
          Opprett
        </button>
      </form>

      <h2 className="font-semibold text-gray-700">Eksisterende idretter</h2>
      <div className="space-y-2">
        {sports?.map(s => (
          <div key={s.id} className="bg-white rounded shadow px-4 py-2 text-sm flex items-center justify-between">
            <span><strong>{s.name}</strong> <span className="text-gray-400">({s.slug})</span></span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              {s.match_type === 'head_to_head' ? 'Kamp' : 'Individuelt'}
              {s.lower_is_better ? ' · lavest vinner' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
