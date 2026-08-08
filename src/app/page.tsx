'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AvatarGrid } from '@/components/AvatarGrid'
import { HowToPlayModal } from '@/components/HowToPlayModal'
import { getOrCreatePlayerId } from '@/lib/player'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🦊')
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const [showHow, setShowHow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const valid = name.trim().length >= 1 && avatar

  function saveSession() {
    sessionStorage.setItem('player-name', name.trim())
    sessionStorage.setItem('player-avatar', avatar)
  }

  async function createLobby() {
    if (!valid) return
    setLoading(true)
    setError('')
    saveSession()
    const playerId = getOrCreatePlayerId()
    const res = await fetch('/api/lobby/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, name: name.trim(), avatar }),
    })
    const data = await res.json()
    if (res.ok) {
      router.push(`/lobby/${data.code}`)
    } else {
      setError(data.error ?? 'Failed to create lobby')
      setLoading(false)
    }
  }

  async function joinLobby() {
    if (!valid || !joinCode.trim()) return
    setLoading(true)
    setError('')
    saveSession()
    const playerId = getOrCreatePlayerId()
    const res = await fetch('/api/lobby/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, name: name.trim(), avatar, code: joinCode.trim().toUpperCase() }),
    })
    const data = await res.json()
    if (res.ok) {
      router.push(`/lobby/${data.code}`)
    } else {
      setError(data.error ?? 'Failed to join lobby')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {showHow && <HowToPlayModal onClose={() => setShowHow(false)} />}

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-indigo-400">Wut Iz Dis?</h1>
          <p className="text-gray-400 mt-1 text-sm">Multiplayer Taboo-style word game</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Your name</label>
            <input
              type="text"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name…"
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Pick an avatar</label>
            <AvatarGrid selected={avatar} onSelect={setAvatar} />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="space-y-3">
          <button
            onClick={createLobby}
            disabled={!valid || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-4 font-bold text-lg transition-colors"
          >
            {loading ? 'Loading…' : '🎮 Create Lobby'}
          </button>

          {!showJoin ? (
            <button
              onClick={() => setShowJoin(true)}
              disabled={!valid}
              className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-4 font-bold text-lg transition-colors"
            >
              🔗 Join Lobby
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && joinLobby()}
                placeholder="Enter code…"
                className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest text-lg uppercase"
              />
              <button
                onClick={joinLobby}
                disabled={!valid || !joinCode.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl px-6 py-3 font-bold transition-colors"
              >
                Join
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowHow(true)}
          className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
        >
          ❓ How to Play
        </button>
      </div>
    </main>
  )
}
