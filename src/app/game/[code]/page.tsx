'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPusherClient } from '@/lib/pusher-client'
import { getOrCreatePlayerId } from '@/lib/player'
import { GiverView } from '@/components/GiverView'
import { GuesserView } from '@/components/GuesserView'
import { Leaderboard, type ScoreEntry } from '@/components/Leaderboard'

type WordCard = { target: string; taboo: string[] }
type GamePhase = 'waiting' | 'playing' | 'leaderboard' | 'ended'

export default function GamePage() {
  const { code } = useParams<{ code: string }>()
  const playerId = useRef<string>('')

  const [phase, setPhase] = useState<GamePhase>('waiting')
  const [playerOrder, setPlayerOrder] = useState<string[]>([])
  const [currentGiverIndex, setCurrentGiverIndex] = useState(0)
  const [turnEndTime, setTurnEndTime] = useState<number | null>(null)
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [wordCard, setWordCard] = useState<WordCard | null>(null)
  const [activity, setActivity] = useState<string[]>([])
  const [isGameOver, setIsGameOver] = useState(false)
  const [hostId, setHostId] = useState<string>('')

  const players = useRef<Record<string, { name: string; avatar: string }>>({})
  const currentGiverIdRef = useRef<string>('')

  const currentGiverId = playerOrder[currentGiverIndex] ?? ''
  const isGiver = playerId.current === currentGiverId
  const isHost = playerId.current === hostId
  currentGiverIdRef.current = currentGiverId

  const addActivity = (msg: string) => setActivity((prev) => [...prev.slice(-19), msg])

  const fetchWord = useCallback(async () => {
    const res = await fetch(`/api/game/current-word?code=${code}&playerId=${playerId.current}`)
    if (res.ok) {
      const data = await res.json()
      setWordCard(data)
    }
  }, [code])

  useEffect(() => {
    playerId.current = getOrCreatePlayerId()

    // Restore initial game state from sessionStorage (set by lobby page on game:started)
    const stored = sessionStorage.getItem(`game-state-${code}`)
    if (stored) {
      const { playerOrder: po, currentGiverId: cg, turnEndTime: te, hostId: hi } = JSON.parse(stored)
      setPlayerOrder(po)
      setCurrentGiverIndex(po.indexOf(cg))
      setTurnEndTime(te)
      if (hi) setHostId(hi)
      setPhase('playing')
    }

    const pusher = getPusherClient()
    const channel = pusher.subscribe(`taboo-${code}`)

    channel.bind('game:started', (data: { playerOrder: string[]; currentGiverId: string; turnEndTime: number; hostId: string }) => {
      setPlayerOrder(data.playerOrder)
      setCurrentGiverIndex(data.playerOrder.indexOf(data.currentGiverId))
      setTurnEndTime(data.turnEndTime)
      if (data.hostId) setHostId(data.hostId)
      setPhase('playing')
    })

    channel.bind('game:correct-guess', (data: {
      guesserId: string
      guesserName: string
      revealedWord: string
      scores: ScoreEntry[]
    }) => {
      setScores(data.scores)
      addActivity(`✅ ${data.guesserName} guessed "${data.revealedWord}"! +1 pt`)
      // Giver fetches next word automatically
      if (playerId.current === currentGiverIdRef.current) fetchWord()
    })

    channel.bind('game:skipped', (data: { skippedWord: string }) => {
      addActivity(`⏭️ Skipped: ${data.skippedWord}`)
      if (playerId.current === currentGiverIdRef.current) fetchWord()
    })

    channel.bind('game:turn-ended', (data: {
      scores: ScoreEntry[]
      nextGiverId: string
      isGameOver: boolean
    }) => {
      setScores(data.scores)
      setIsGameOver(data.isGameOver)
      setPhase('leaderboard')
      setWordCard(null)
    })

    channel.bind('game:next-turn', (data: { nextGiverId: string; turnEndTime: number }) => {
      setPlayerOrder((prev) => {
        const idx = prev.indexOf(data.nextGiverId)
        setCurrentGiverIndex(idx)
        return prev
      })
      setTurnEndTime(data.turnEndTime)
      setPhase('playing')
      setActivity([])
    })

    channel.bind('game:ended', (data: { finalScores: ScoreEntry[]; winnerId: string }) => {
      setScores(data.finalScores)
      setIsGameOver(true)
      setPhase('ended')
    })

    return () => {
      pusher.unsubscribe(`taboo-${code}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // Fetch word once phase becomes 'playing' and I am the giver
  useEffect(() => {
    if (phase === 'playing' && isGiver) {
      fetchWord()
    }
  }, [phase, isGiver, fetchWord])

  async function handleTimerExpire() {
    if (!isGiver) return
    await fetch('/api/game/end-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: playerId.current, code }),
    })
  }

  async function handleSkip() {
    await fetch('/api/game/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: playerId.current, code }),
    })
  }

  async function handleGuess(guess: string) {
    await fetch('/api/game/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: playerId.current, code, guess }),
    })
  }

  async function handleNextTurnReady() {
    await fetch('/api/game/start-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: playerId.current, code }),
    })
  }

  const giver = scores.find((s) => s.id === currentGiverId)
  const turnNumber = currentGiverIndex + 1
  const totalTurns = playerOrder.length

  if (phase === 'waiting') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Waiting for game to start…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative">
      {(phase === 'leaderboard' || phase === 'ended') && (
        <Leaderboard
          scores={scores}
          isGameOver={isGameOver}
          isHost={isHost}
          onNextTurnReady={handleNextTurnReady}
        />
      )}

      {phase === 'playing' && isGiver && wordCard && (
        <GiverView
          target={wordCard.target}
          taboo={wordCard.taboo}
          turnEndTime={turnEndTime}
          onSkip={handleSkip}
          onTimerExpire={handleTimerExpire}
          turnNumber={turnNumber}
          totalTurns={totalTurns}
          scores={scores}
          activity={activity}
        />
      )}

      {phase === 'playing' && !isGiver && (
        <GuesserView
          giverName={giver?.name ?? '?'}
          giverAvatar={giver?.avatar ?? '🎭'}
          turnEndTime={turnEndTime}
          onGuess={handleGuess}
          turnNumber={turnNumber}
          totalTurns={totalTurns}
          scores={scores}
          activity={activity}
        />
      )}

      {phase === 'playing' && isGiver && !wordCard && (
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Loading your word…</p>
        </main>
      )}
    </main>
  )
}
