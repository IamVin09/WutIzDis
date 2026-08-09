import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby } from '@/lib/redis'
import { pusherServer } from '@/lib/pusher-server'

export async function POST(req: NextRequest) {
  const { playerId, code } = await req.json()

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  if (lobby.status !== 'playing') return NextResponse.json({ ok: false })

  const currentGiverId = lobby.playerOrder[lobby.currentGiverIndex]
  if (playerId !== currentGiverId) return NextResponse.json({ error: 'Not the giver' }, { status: 403 })
  if (lobby.turnEndTime && Date.now() < lobby.turnEndTime) {
    return NextResponse.json({ error: 'Turn not over yet' }, { status: 400 })
  }

  const isGameOver = lobby.currentGiverIndex + 1 >= lobby.playerOrder.length

  const scores = lobby.players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score }))

  if (isGameOver) {
    lobby.status = 'ended'
    await setLobby(lobby)
    await pusherServer.trigger(`taboo-${code}`, 'game:ended', {
      finalScores: scores,
      winnerId: [...scores].sort((a, b) => b.score - a.score)[0]?.id,
    })
    return NextResponse.json({ ok: true, isGameOver: true })
  }

  lobby.status = 'turn_end'
  lobby.leaderboardEndTime = null
  await setLobby(lobby)

  const nextGiverIndex = lobby.currentGiverIndex + 1
  const nextGiverId = lobby.playerOrder[nextGiverIndex]

  await pusherServer.trigger(`taboo-${code}`, 'game:turn-ended', {
    scores,
    nextGiverId,
    isGameOver: false,
  })

  return NextResponse.json({ ok: true, isGameOver: false })
}
