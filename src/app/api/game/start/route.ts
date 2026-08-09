import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby, shuffle } from '@/lib/redis'
import { pusherServer } from '@/lib/pusher-server'
import { WORDS } from '@/data/words'

export async function POST(req: NextRequest) {
  const { playerId, code } = await req.json()

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  if (lobby.hostId !== playerId) return NextResponse.json({ error: 'Not host' }, { status: 403 })
  if (lobby.status !== 'waiting') return NextResponse.json({ error: 'Already started' }, { status: 409 })
  if (lobby.players.length < 2) return NextResponse.json({ error: 'Need at least 2 players' }, { status: 400 })

  const playerOrder = shuffle(lobby.players.map((p) => p.id))
  const wordOrder = shuffle(Array.from({ length: WORDS.length }, (_, i) => i))
  const turnEndTime = Date.now() + 120_000

  lobby.status = 'playing'
  lobby.playerOrder = playerOrder
  lobby.currentGiverIndex = 0
  lobby.wordOrder = wordOrder
  lobby.currentWordPosition = 0
  lobby.turnEndTime = turnEndTime
  lobby.leaderboardEndTime = null

  await setLobby(lobby)

  await pusherServer.trigger(`taboo-${code}`, 'game:started', {
    playerOrder,
    currentGiverId: playerOrder[0],
    turnEndTime,
    hostId: lobby.hostId,
  })

  return NextResponse.json({ ok: true })
}
