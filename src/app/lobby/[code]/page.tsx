'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPusherClient } from '@/lib/pusher-client'
import { getOrCreatePlayerId } from '@/lib/player'
import { PlayerCard } from '@/components/PlayerCard'

type Player = { id: string; name: string; avatar: string; score: number }

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [hostId, setHostId] = useState<string>('')
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const playerId = useRef<string>(getOrCreatePlayerId())

  useEffect(() => {
    // Load initial state by re-joining (idempotent)
    const name = sessionStorage.getItem('player-name') ?? 'Player'
    const avatar = sessionStorage.getItem('player-avatar') ?? '🦊'

    fetch('/api/lobby/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: playerId.current, name, avatar, code }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.hostId) setHostId(data.hostId)
        if (data.players) setPlayers(data.players)
      })
      .catch(() => setError('Failed to connect to lobby'))

    const pusher = getPusherClient()
    const channel = pusher.subscribe(`taboo-${code}`)

    channel.bind('lobby:player-joined', (data: { player: Player }) => {
      setPlayers((prev) => {
        if (prev.find((p) => p.id === data.player.id)) return prev
        return [...prev, data.player]
      })
    })

    channel.bind('game:started', (data: { playerOrder: string[]; currentGiverId: string; turnEndTime: number; hostId: string }) => {
      sessionStorage.setItem(`game-state-${code}`, JSON.stringify({ ...data, hostId: data.hostId ?? hostId }))
      router.push(`/game/${code}`)
    })

    return () => {
      pusher.unsubscribe(`taboo-${code}`)
    }
  }, [code, router])

  async function startGame() {
    setStarting(true)
    setError('')
    const res = await fetch('/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: playerId.current, code }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to start game')
      setStarting(false)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isHost = playerId.current === hostId

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-400">Wut Iz Dis?</h1>
          <p className="text-gray-400 text-sm mt-1">Waiting for players…</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-400 mb-2">Lobby code</p>
          <p className="text-4xl font-mono font-bold tracking-widest text-white">{code}</p>
          <button
            onClick={copyCode}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {copied ? '✅ Copied!' : '📋 Copy code'}
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-5">
          <p className="text-sm text-gray-400 mb-3">Players ({players.length})</p>
          <div className="flex flex-wrap gap-3">
            {players.map((p) => (
              <PlayerCard
                key={p.id}
                name={p.name}
                avatar={p.avatar}
                isHost={p.id === hostId}
              />
            ))}
            {players.length === 0 && (
              <p className="text-gray-600 text-sm">No players yet — share the code!</p>
            )}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {isHost ? (
          <button
            onClick={startGame}
            disabled={players.length < 2 || starting}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-4 font-bold text-lg transition-colors"
          >
            {starting ? 'Starting…' : players.length < 2 ? 'Need 2+ players to start' : '🚀 Start Game'}
          </button>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Waiting for host to start the game…
          </div>
        )}
      </div>
    </main>
  )
}
