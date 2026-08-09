import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby } from '@/lib/redis'
import { pusherServer } from '@/lib/pusher-server'

export async function POST(req: NextRequest) {
  const { playerId, name, avatar, code } = await req.json()

  if (!playerId || !name || !avatar || !code) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const lobby = await getLobby(code.toUpperCase())
  if (!lobby) {
    return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  }
  if (lobby.status !== 'waiting') {
    return NextResponse.json({ error: 'Game already started' }, { status: 409 })
  }

  // Idempotent: if player already in lobby, return success
  const existing = lobby.players.find((p) => p.id === playerId)
  if (!existing) {
    if (lobby.players.length >= 16) {
      return NextResponse.json({ error: 'Lobby is full' }, { status: 409 })
    }
    const player = { id: playerId, name, avatar, score: 0 }
    lobby.players.push(player)
    await setLobby(lobby)
    await pusherServer.trigger(`taboo-${lobby.code}`, 'lobby:player-joined', { player })
  }

  return NextResponse.json({ code: lobby.code, hostId: lobby.hostId, players: lobby.players })
}
