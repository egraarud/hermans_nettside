import { useState } from 'react'
import { useParticipants, useCreateParticipant, useEditionParticipants, useAddEditionParticipant } from '../../api/participants'
import { useCurrentEdition } from '../../hooks/useCurrentEdition'

export default function AdminParticipantsPanel() {
  const { edition } = useCurrentEdition()
  const { data: participants } = useParticipants()
  const { data: editionParticipants } = useEditionParticipants(edition?.id ?? 0)
  const create = useCreateParticipant()
  const addToEdition = useAddEditionParticipant(edition?.id ?? 0)

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [feedback, setFeedback] = useState('')

  const editionPids = new Set(editionParticipants?.map(p => p.id) ?? [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await create.mutateAsync({ name, nickname: nickname || undefined })
      if (edition) await addToEdition.mutateAsync(created.id)
      setName('')
      setNickname('')
      setFeedback(`${created.name} lagt til!`)
    } catch (err: any) {
      setFeedback(err?.response?.data?.detail ?? 'Feil')
    }
  }

  const handleAddExisting = async (pid: number) => {
    if (!edition) return
    try {
      await addToEdition.mutateAsync(pid)
    } catch {
      // already added or error
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-semibold text-gray-700">Ny deltaker</h2>
      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-5 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Navn</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Kallenavn (valgfritt)</label>
          <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
        </div>
        {feedback && <p className="text-sm text-green-700">{feedback}</p>}
        <button type="submit" disabled={create.isPending}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm disabled:opacity-60">
          Opprett og legg til i {edition?.name ?? 'turneringen'}
        </button>
      </form>

      {edition && (
        <>
          <h2 className="font-semibold text-gray-700">Deltakere i {edition.name}</h2>
          <div className="space-y-1">
            {participants?.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded shadow-sm px-4 py-2 text-sm">
                <span>{p.name}{p.nickname ? ` (${p.nickname})` : ''}</span>
                {editionPids.has(p.id) ? (
                  <span className="text-green-600 text-xs">✓ Påmeldt</span>
                ) : (
                  <button onClick={() => handleAddExisting(p.id)}
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-0.5 rounded">
                    Legg til
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
