import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby } from '@/lib/redis'
import { pusherServer } from '@/lib/pusher-server'

export async function POST(req: NextRequest) {
  const { playerId, code, detectedWord } = await req.json()

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  if (lobby.status !== 'playing') return NextResponse.json({ ok: false })

  const currentGiverId = lobby.playerOrder[lobby.currentGiverIndex]
  if (playerId !== currentGiverId) return NextResponse.json({ error: 'Not the giver' }, { status: 403 })

  const giver = lobby.players.find((p) => p.id === playerId)
  if (giver) giver.score -= 1
  lobby.currentWordPosition += 1
  await setLobby(lobby)

  const scores = lobby.players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score }))
  await pusherServer.trigger(`taboo-${code}`, 'game:taboo-called', {
    giverId: playerId,
    giverName: giver?.name ?? 'Giver',
    detectedWord,
    scores,
  })

  return NextResponse.json({ ok: true })
}
