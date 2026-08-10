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

  const now = Date.now()
  const turnStartTime = now + 5_000
  const turnEndTime = turnStartTime + 120_000
  lobby.status = 'playing'
  lobby.currentGiverIndex = nextGiverIndex
  // Skip the word that was on-screen when the previous turn's timer expired
  if (lobby.currentWordPosition < lobby.wordOrder.length - 1) {
    lobby.currentWordPosition += 1
  }
  lobby.turnStartTime = turnStartTime
  lobby.turnEndTime = turnEndTime
  lobby.leaderboardEndTime = null

  await setLobby(lobby)

  await pusherServer.trigger(`taboo-${code}`, 'game:next-turn', {
    nextGiverId,
    turnStartTime,
    turnEndTime,
    serverNow: now,
  })

  return NextResponse.json({ ok: true })
}
