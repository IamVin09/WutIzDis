import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby } from '@/lib/redis'
import { pusherServer } from '@/lib/pusher-server'

export async function POST(req: NextRequest) {
  const { playerId, code } = await req.json()

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  if (lobby.status !== 'turn_end') return NextResponse.json({ ok: false })

  if (playerId !== lobby.hostId) return NextResponse.json({ error: 'Not the host' }, { status: 403 })

  const nextGiverIndex = lobby.currentGiverIndex + 1
  const nextGiverId = lobby.playerOrder[nextGiverIndex]

  const turnEndTime = Date.now() + 120_000
  lobby.status = 'playing'
  lobby.currentGiverIndex = nextGiverIndex
  lobby.turnEndTime = turnEndTime
  lobby.leaderboardEndTime = null

  await setLobby(lobby)

  await pusherServer.trigger(`taboo-${code}`, 'game:next-turn', {
    nextGiverId,
    turnEndTime,
  })

  return NextResponse.json({ ok: true })
}
