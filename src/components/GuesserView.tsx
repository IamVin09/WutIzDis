'use client'

import { useEffect, useRef, useState } from 'react'
import { CountdownTimer } from './CountdownTimer'
import type { ScoreEntry } from './Leaderboard'

type Props = {
  giverName: string
  giverAvatar: string
  turnEndTime: number | null
  clockOffset: number
  onGuess: (guess: string) => Promise<boolean>
  turnNumber: number
  totalTurns: number
  scores: ScoreEntry[]
  activity: string[]
}

export function GuesserView({ giverName, giverAvatar, turnEndTime, clockOffset, onGuess, turnNumber, totalTurns, scores, activity }: Props) {
  const [input, setInput] = useState('')
  const [showWrong, setShowWrong] = useState(false)
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current)
  }, [])

  const submit = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    const correct = await onGuess(trimmed)
    if (!correct) {
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current)
      setShowWrong(true)
      wrongTimerRef.current = setTimeout(() => setShowWrong(false), 2000)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto py-6 px-4">
      <div className="text-center text-gray-400 text-sm font-medium">
        Turn {turnNumber} of {totalTurns} —{' '}
        <span className="text-white">
          {giverAvatar} {giverName}
        </span>{' '}
        is describing!
      </div>

      <CountdownTimer endTime={turnEndTime} clockOffset={clockOffset} />

      <div className="w-full bg-gray-800/40 rounded-2xl p-5 text-center border border-gray-700">
        <p className="text-gray-400 text-sm mb-1">Listen and type your answer</p>
        <p className="text-gray-500 text-xs">The clue-giver cannot say certain words. Be the first to guess right!</p>
      </div>

      {showWrong && (
        <div className="w-full bg-red-900/70 border border-red-600 text-red-200 text-sm font-semibold text-center rounded-xl py-2 px-4">
          ❌ Wrong answer — try again!
        </div>
      )}

      <div className="w-full flex gap-2">
        <input
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          placeholder="Type your guess…"
          className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
        />
        <button
          onClick={submit}
          className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-5 py-3 font-bold transition-colors"
        >
          Go!
        </button>
      </div>

      {activity.length > 0 && (
        <div className="w-full bg-gray-800/50 rounded-xl p-3 space-y-1 max-h-36 overflow-y-auto">
          {[...activity].reverse().map((msg, i) => (
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
