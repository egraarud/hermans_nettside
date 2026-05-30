import { useState } from 'react'
import { useCurrentEdition } from '../../hooks/useCurrentEdition'
import { useSports } from '../../api/sports'
import { useEditionParticipants } from '../../api/participants'
import { useSubmitResult, useSubmitMatch } from '../../api/results'

export default function AdminScorePanel() {
  const { edition } = useCurrentEdition()
  const { data: sports } = useSports()
  const { data: participants } = useEditionParticipants(edition?.id ?? 0)
  const submitResult = useSubmitResult(edition?.id ?? 0)
  const submitMatch = useSubmitMatch(edition?.id ?? 0)

  const [sportId, setSportId] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [score, setScore] = useState('')
  const [playerAId, setPlayerAId] = useState('')
  const [playerBId, setPlayerBId] = useState('')
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [winnerId, setWinnerId] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const selectedSport = sports?.find(s => s.id === Number(sportId))
  const isH2H = selectedSport?.match_type === 'head_to_head'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    try {
      if (isH2H) {
        await submitMatch.mutateAsync({
          sport_id: Number(sportId),
          player_a_id: Number(playerAId),
          player_b_id: Number(playerBId),
          score_a: scoreA || undefined,
          score_b: scoreB || undefined,
          winner_id: winnerId ? Number(winnerId) : null,
        })
      } else {
        await submitResult.mutateAsync({
          sport_id: Number(sportId),
          participant_id: Number(participantId),
          score: Number(score),
        })
      }
      setFeedback({ ok: true, msg: 'Lagret!' })
      setScore(''); setScoreA(''); setScoreB(''); setWinnerId('')
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.response?.data?.detail ?? 'Feil' })
    }
  }

  if (!edition) return <p className="text-gray-500">Ingen aktiv turnering.</p>

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="font-semibold text-gray-700">Registrer resultat / kamp</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Idrett</label>
          <select value={sportId} onChange={e => { setSportId(e.target.value); setWinnerId('') }} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="">Velg...</option>
            {sports?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {selectedSport && !isH2H && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deltaker</label>
              <select value={participantId} onChange={e => setParticipantId(e.target.value)} required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="">Velg...</option>
                {participants?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resultat</label>
              <input type="number" step="any" value={score} onChange={e => setScore(e.target.value)} required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          </>
        )}

        {selectedSport && isH2H && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spiller A</label>
                <select value={playerAId} onChange={e => setPlayerAId(e.target.value)} required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  <option value="">Velg...</option>
                  {participants?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spiller B</label>
                <select value={playerBId} onChange={e => setPlayerBId(e.target.value)} required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  <option value="">Velg...</option>
                  {participants?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score A</label>
                <input type="text" value={scoreA} onChange={e => setScoreA(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="f.eks. 21-15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score B</label>
                <input type="text" value={scoreB} onChange={e => setScoreB(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="f.eks. 15-21" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vinner</label>
              <select value={winnerId} onChange={e => setWinnerId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="">Uavgjort</option>
                {playerAId && <option value={playerAId}>{participants?.find(p => p.id === Number(playerAId))?.name ?? 'Spiller A'}</option>}
                {playerBId && <option value={playerBId}>{participants?.find(p => p.id === Number(playerBId))?.name ?? 'Spiller B'}</option>}
              </select>
            </div>
          </>
        )}

        {feedback && (
          <p className={`text-sm ${feedback.ok ? 'text-green-700' : 'text-red-600'}`}>{feedback.msg}</p>
        )}
        <button type="submit" disabled={submitResult.isPending || submitMatch.isPending}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded transition disabled:opacity-60">
          Lagre
        </button>
      </form>
    </div>
  )
}
