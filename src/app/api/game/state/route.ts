import { NextRequest, NextResponse } from 'next/server'
import { getLobby } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const playerId = searchParams.get('playerId')

  if (!code || !playerId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  if (lobby.status === 'waiting') return NextResponse.json({ error: 'Game not started' }, { status: 409 })

  const phase =
    lobby.status === 'playing' ? 'playing' :
    lobby.status === 'turn_end' ? 'leaderboard' : 'ended'

  const scores = lobby.players.map((p) => ({
    id: p.id, name: p.name, avatar: p.avatar, score: p.score,
  }))

  return NextResponse.json({
    phase,
    playerOrder: lobby.playerOrder,
    currentGiverIndex: lobby.currentGiverIndex,
    turnStartTime: lobby.turnStartTime,
    turnEndTime: lobby.turnEndTime,
    hostId: lobby.hostId,
    scores,
    isGameOver: lobby.status === 'ended',
    serverNow: Date.now(),
    maxGivers: lobby.maxGivers ?? lobby.playerOrder.length,
  })
}
