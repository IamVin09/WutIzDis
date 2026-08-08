'use client'

import { useEffect, useState } from 'react'

export type ScoreEntry = { id: string; name: string; avatar: string; score: number }

type Props = {
  scores: ScoreEntry[]
  isGameOver: boolean
  leaderboardEndTime?: number | null
  nextGiverId?: string
  myPlayerId?: string
  onNextTurnReady?: () => void
}

export function Leaderboard({ scores, isGameOver, leaderboardEndTime, nextGiverId, myPlayerId, onNextTurnReady }: Props) {
  const [countdown, setCountdown] = useState<number>(10)
  const sorted = [...scores].sort((a, b) => b.score - a.score)
  const winner = sorted[0]

  useEffect(() => {
    if (isGameOver || !leaderboardEndTime) return

    const update = () => {
      const remaining = Math.max(0, Math.floor((leaderboardEndTime - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0 && myPlayerId === nextGiverId) {
        onNextTurnReady?.()
      }
    }

    update()
    const id = setInterval(update, 500)
    return () => clearInterval(id)
  }, [leaderboardEndTime, isGameOver, myPlayerId, nextGiverId, onNextTurnReady])

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-1">
          {isGameOver ? '🏆 Game Over!' : '📊 Leaderboard'}
        </h2>
        {isGameOver && (
          <p className="text-center text-yellow-400 font-semibold mb-3">
            {winner.avatar} {winner.name} wins!
          </p>
        )}

        <div className="space-y-2 my-4">
          {sorted.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                i === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-gray-800'
              }`}
            >
              <span className="text-lg font-bold text-gray-400 w-5">{i + 1}</span>
              <span className="text-2xl">{entry.avatar}</span>
              <span className="flex-1 font-semibold">{entry.name}</span>
              <span className="font-bold text-indigo-300">{entry.score} pt{entry.score !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>

        {!isGameOver && (
          <p className="text-center text-gray-400 text-sm">
            {myPlayerId === nextGiverId
              ? `Your turn next! Starting in ${countdown}s…`
              : `Next turn in ${countdown}s…`}
          </p>
        )}
        {isGameOver && (
          <a
            href="/"
            className="mt-2 block text-center bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-bold transition-colors"
          >
            Play Again
          </a>
        )}
      </div>
    </div>
  )
}
