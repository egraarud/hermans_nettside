import type { Leaderboard } from '../../api/leaderboard'

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

interface Props {
  lb: Leaderboard
  highlightParticipantId?: number
}

export default function LeaderboardTable({ lb, highlightParticipantId }: Props) {
  const isIndividual = lb.match_type === 'individual'
  const isH2H = lb.match_type === 'head_to_head'
  const isOverall = lb.match_type === 'overall'

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <th className="px-4 py-3 w-12">#</th>
            <th className="px-4 py-3">Deltaker</th>
            {isIndividual && <th className="px-4 py-3 text-right">Resultat</th>}
            {isH2H && (
              <>
                <th className="px-4 py-3 text-right">V</th>
                <th className="px-4 py-3 text-right">U</th>
                <th className="px-4 py-3 text-right">T</th>
                <th className="px-4 py-3 text-right">Poeng</th>
              </>
            )}
            {isOverall && <th className="px-4 py-3 text-right">Poeng</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {lb.entries.map(entry => {
            const isMe = entry.participant_id === highlightParticipantId
            const isTop3 = entry.rank <= 3
            return (
              <tr
                key={entry.participant_id}
                className={`transition-colors ${
                  isMe
                    ? 'bg-amber-50'
                    : isTop3
                    ? 'bg-white hover:bg-slate-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <td className="px-4 py-3 w-12">
                  {MEDAL[entry.rank]
                    ? <span className="text-base">{MEDAL[entry.rank]}</span>
                    : <span className="text-slate-400 font-medium tabular-nums">{entry.rank}</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${isTop3 ? 'text-slate-800' : 'text-slate-700'}`}>
                    {entry.participant_name}
                  </span>
                  {isMe && (
                    <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                      deg
                    </span>
                  )}
                </td>
                {isIndividual && (
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700">
                    {entry.score}
                  </td>
                )}
                {isH2H && (
                  <>
                    <td className="px-4 py-3 text-right text-slate-600">{entry.wins ?? 0}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{entry.draws ?? 0}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{entry.losses ?? 0}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{entry.points ?? 0}</td>
                  </>
                )}
                {isOverall && (
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{entry.total_points ?? 0}</td>
                )}
              </tr>
            )
          })}
          {lb.entries.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-400 text-sm">
                Ingen resultater ennå
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
