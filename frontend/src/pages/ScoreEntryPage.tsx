import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useCurrentEdition } from '../hooks/useCurrentEdition'
import { useSports } from '../api/sports'
import { useEditionParticipants } from '../api/participants'
import { useSubmitResult, useSubmitMatch, useUpdateMatch, useMatch } from '../api/results'
import { useMe } from '../api/auth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function ScoreEntryPage() {
  const [searchParams] = useSearchParams()
  const preMatchId = searchParams.get('match') ? Number(searchParams.get('match')) : undefined
  const preSportId = searchParams.get('sport') ? Number(searchParams.get('sport')) : undefined
  const preDeltakerId = searchParams.get('deltaker') ? Number(searchParams.get('deltaker')) : undefined

  const { edition, isLoading } = useCurrentEdition()
  const { data: sports } = useSports()
  const { data: me } = useMe()
  const { data: participants } = useEditionParticipants(edition?.id ?? 0)
  const { data: preMatch } = useMatch(edition?.id ?? 0, preMatchId)

  const submitResult = useSubmitResult(edition?.id ?? 0)
  const submitMatch = useSubmitMatch(edition?.id ?? 0)
  const updateMatch = useUpdateMatch(edition?.id ?? 0)
  const navigate = useNavigate()

  const [sportId, setSportId] = useState('')
  const [score, setScore] = useState('')
  const [playerBId, setPlayerBId] = useState('')
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [winnerId, setWinnerId] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  // Pre-fill from query params once data is loaded
  useEffect(() => {
    if (preSportId) setSportId(String(preSportId))
  }, [preSportId])

  useEffect(() => {
    if (!preMatch || !me) return
    setSportId(String(preMatch.sport_id))
    const opponentId = preMatch.player_a_id === me.participant_id
      ? preMatch.player_b_id
      : preMatch.player_a_id
    setPlayerBId(String(opponentId))
    if (preMatch.score_a) setScoreA(preMatch.score_a)
    if (preMatch.score_b) setScoreB(preMatch.score_b)
    if (preMatch.winner_id) setWinnerId(String(preMatch.winner_id))
  }, [preMatch, me])

  if (isLoading) return <LoadingSpinner />
  if (!edition) return <p className="text-slate-500">Ingen aktiv turnering.</p>
  if (!me) { navigate('/logg-inn'); return null }

  const selectedSport = sports?.find(s => s.id === Number(sportId))
  const isH2H = selectedSport?.match_type === 'head_to_head'
  const isPreFilled = !!preMatchId || !!preSportId

  // For pre-filled match, determine "my" ID vs opponent
  const myParticipantId = me.participant_id
  let opponentId: number | undefined
  let myScoreLabel = 'Din score'
  let opponentScoreLabel = 'Motstanderens score'

  if (preMatch && myParticipantId) {
    opponentId = preMatch.player_a_id === myParticipantId
      ? preMatch.player_b_id
      : preMatch.player_a_id
    const myName = participants?.find(p => p.id === myParticipantId)?.name ?? 'Deg'
    const oppName = participants?.find(p => p.id === opponentId)?.name ?? 'Motstander'
    myScoreLabel = `${myName} sin score`
    opponentScoreLabel = `${oppName} sin score`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    try {
      if (preMatchId && preMatch) {
        // Updating an existing planned match
        const isPlayerA = preMatch.player_a_id === myParticipantId
        await updateMatch.mutateAsync({
          matchId: preMatchId,
          body: {
            score_a: isPlayerA ? (scoreA || undefined) : (scoreB || undefined),
            score_b: isPlayerA ? (scoreB || undefined) : (scoreA || undefined),
            winner_id: winnerId ? Number(winnerId) : null,
          },
        })
      } else if (isH2H) {
        await submitMatch.mutateAsync({
          sport_id: Number(sportId),
          player_a_id: myParticipantId!,
          player_b_id: Number(playerBId),
          score_a: scoreA || undefined,
          score_b: scoreB || undefined,
          winner_id: winnerId ? Number(winnerId) : null,
        })
      } else {
        await submitResult.mutateAsync({
          sport_id: Number(sportId),
          participant_id: preDeltakerId ?? myParticipantId!,
          score: Number(score),
        })
      }
      setFeedback({ ok: true, msg: 'Resultat registrert!' })
      setScore('')
      setScoreA('')
      setScoreB('')
      setWinnerId('')
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.response?.data?.detail ?? 'Noe gikk galt.' })
    }
  }

  const myName = participants?.find(p => p.id === myParticipantId)?.name ?? me.username
  const opponents = participants?.filter(p => p.id !== myParticipantId) ?? []
  const opponentName = opponentId ? participants?.find(p => p.id === opponentId)?.name : undefined
  const preDeltakerName = preDeltakerId ? participants?.find(p => p.id === preDeltakerId)?.name : undefined

  const isPending = submitResult.isPending || submitMatch.isPending || updateMatch.isPending

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Registrer resultat</h1>
        {!isPreFilled && (
          <p className="text-sm text-slate-500 mt-1">Du registrerer som: <strong>{myName}</strong></p>
        )}
      </div>

      {!me.participant_id && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
          Kontoen din er ikke koblet til en deltaker. Kontakt administrator.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">

        {/* Sport selector or locked sport name */}
        {isPreFilled && selectedSport ? (
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Idrett</p>
              <p className="font-semibold text-slate-800">{selectedSport.name}</p>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Idrett</label>
            <select
              value={sportId}
              onChange={e => { setSportId(e.target.value); setWinnerId('') }}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Velg idrett...</option>
              {sports?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {/* Individual result */}
        {selectedSport && !isH2H && (
          <div>
            {preDeltakerName && (
              <p className="text-sm text-slate-500 mb-2">Deltaker: <strong>{preDeltakerName}</strong></p>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Resultat {selectedSport.lower_is_better ? '(lavest vinner)' : '(høyest vinner)'}
            </label>
            <input
              type="number"
              step="any"
              value={score}
              onChange={e => setScore(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Skriv inn resultatet"
            />
          </div>
        )}

        {/* H2H result */}
        {selectedSport && isH2H && (
          <>
            {/* Opponent — locked if pre-filled match */}
            {preMatchId && opponentName ? (
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Kamp</p>
                  <p className="font-semibold text-slate-800">{myName} vs {opponentName}</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motstander</label>
                <select
                  value={playerBId}
                  onChange={e => setPlayerBId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Velg motstander...</option>
                  {opponents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{myScoreLabel}</label>
                <input
                  type="text"
                  value={scoreA}
                  onChange={e => setScoreA(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="f.eks. 21-15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{opponentScoreLabel}</label>
                <input
                  type="text"
                  value={scoreB}
                  onChange={e => setScoreB(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="f.eks. 15-21"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vinner</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Jeg vant', value: String(myParticipantId) },
                  { label: opponentName ? `${opponentName} vant` : 'Motstander vant', value: preMatchId ? String(opponentId) : playerBId },
                  { label: 'Uavgjort', value: '' },
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="winner"
                      value={opt.value}
                      checked={winnerId === opt.value}
                      onChange={() => setWinnerId(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {feedback && (
          <p className={`text-sm font-medium ${feedback.ok ? 'text-emerald-700' : 'text-red-600'}`}>
            {feedback.msg}
          </p>
        )}

        <button
          type="submit"
          disabled={!me.participant_id || isPending}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {isPending ? 'Lagrer...' : 'Registrer resultat'}
        </button>
      </form>
    </div>
  )
}
