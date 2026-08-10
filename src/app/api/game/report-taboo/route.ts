import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby } from '@/lib/redis'
import { pusherServer } from '@/lib/pusher-server'
import { WORDS } from '@/data/words'

export async function POST(req: NextRequest) {
  const { playerId, code, detectedWord } = await req.json()

  if (!playerId || !code || !detectedWord) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  if (lobby.status !== 'playing') return NextResponse.json({ ok: false })

  const currentGiverId = lobby.playerOrder[lobby.currentGiverIndex]
  if (playerId !== currentGiverId) return NextResponse.json({ error: 'Not the giver' }, { status: 403 })

  const wordIndex = lobby.wordOrder[lobby.currentWordPosition]
  const currentWord = WORDS[wordIndex]
  if (!currentWord?.taboo.some((t) => t.toLowerCase() === detectedWord.toLowerCase())) {
    return NextResponse.json({ error: 'Word not in taboo list' }, { status: 400 })
  }

  const giver = lobby.players.find((p) => p.id === playerId)
  if (giver) giver.score -= 1
  if (lobby.currentWordPosition < lobby.wordOrder.length - 1) {
    lobby.currentWordPosition += 1
  }
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
