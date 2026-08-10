'use client'

import { CountdownTimer } from './CountdownTimer'
import type { ScoreEntry } from './Leaderboard'

type Props = {
  target: string
  taboo: string[]
  turnEndTime: number | null
  clockOffset: number
  onSkip: () => void
  onTimerExpire: () => void
  turnNumber: number
  totalTurns: number
  scores: ScoreEntry[]
  activity: string[]
}

export function GiverView({ target, taboo, turnEndTime, clockOffset, onSkip, onTimerExpire, turnNumber, totalTurns, scores, activity }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto py-6 px-4">
      <div className="text-center text-gray-400 text-sm font-medium">
        Turn {turnNumber} of {totalTurns} — You&apos;re describing!
      </div>

      <CountdownTimer endTime={turnEndTime} clockOffset={clockOffset} onExpire={onTimerExpire} />

      <div className="w-full bg-gray-800 rounded-2xl p-6 text-center shadow-xl">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Describe this word</p>
        <p className="text-4xl font-extrabold tracking-wide text-white uppercase mb-6">{target}</p>
        <div className="border-t border-gray-700 pt-4">
          <p className="text-xs uppercase tracking-widest text-red-400 mb-2">❌ Do NOT say</p>
          <div className="flex flex-col gap-1">
            {taboo.map((word) => (
              <span key={word} className="text-gray-300 text-sm line-through decoration-red-500">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onSkip}
        className="bg-gray-700 hover:bg-gray-600 rounded-xl px-8 py-3 font-bold transition-colors"
      >
        Skip →
      </button>

      {activity.length > 0 && (
        <div className="w-full bg-gray-800/50 rounded-xl p-3 space-y-1 max-h-28 overflow-y-auto">
          {activity.map((msg, i) => (
            <p key={i} className="text-sm text-gray-300">{msg}</p>
          ))}
        </div>
      )}

      <div className="w-full">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Scores</p>
        <div className="flex gap-2 flex-wrap">
          {[...scores].sort((a, b) => b.score - a.score).map((s) => (
            <div key={s.id} className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1 text-sm">
              <span>{s.avatar}</span>
              <span className="text-gray-300">{s.name}</span>
              <span className="text-indigo-300 font-bold">{s.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
