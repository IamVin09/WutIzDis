'use client'

import { useEffect, useRef } from 'react'
import { CountdownTimer } from './CountdownTimer'
import type { ScoreEntry } from './Leaderboard'

type Props = {
  target: string
  taboo: string[]
  turnEndTime: number | null
  clockOffset: number
  onSkip: () => void
  onTimerExpire: () => void
  onTabooDetected: (word: string) => void
  turnNumber: number
  totalTurns: number
  scores: ScoreEntry[]
  activity: string[]
}

export function GiverView({ target, taboo, turnEndTime, clockOffset, onSkip, onTimerExpire, onTabooDetected, turnNumber, totalTurns, scores, activity }: Props) {
  // Keep callback and taboo list current without adding them to the recognition effect's deps
  const onTabooDetectedRef = useRef(onTabooDetected)
  useEffect(() => { onTabooDetectedRef.current = onTabooDetected }, [onTabooDetected])
  const tabooRef = useRef(taboo)
  useEffect(() => { tabooRef.current = taboo }, [taboo])

  // One detection per word — reset when the target word changes
  const firedRef = useRef(false)
  useEffect(() => { firedRef.current = false }, [target])

  // Speech recognition — runs for the lifetime of this component (one turn)
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return  // Firefox / mobile Safari — degrade silently

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const words = transcript.toLowerCase().split(/\s+/).map((w: string) => w.replace(/[^a-z]/g, ''))
        for (const t of tabooRef.current) {
          if (words.includes(t.toLowerCase()) && !firedRef.current) {
            firedRef.current = true
            onTabooDetectedRef.current(t)
            return
          }
        }
      }
    }

    // Chrome auto-stops after a period of silence — always restart unless unmounting
    recognition.onend = () => { try { recognition.start() } catch { /* ignore */ } }
    recognition.onerror = () => { /* mic denied or network error — degrade silently */ }

    try { recognition.start() } catch { /* ignore */ }

    return () => {
      recognition.onend = null  // prevent restart loop during cleanup
      try { recognition.stop() } catch { /* ignore */ }
    }
  }, [])  // taboo list and callback accessed via refs — no deps needed

  const hasSpeechAPI = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto py-6 px-4">
      <div className="text-center text-gray-400 text-sm font-medium">
        Turn {turnNumber} of {totalTurns} — You&apos;re describing!
      </div>

      <CountdownTimer endTime={turnEndTime} clockOffset={clockOffset} onExpire={onTimerExpire} />

      {hasSpeechAPI && (
        <p className="text-xs text-gray-500">🎤 Listening for taboo words</p>
      )}

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
