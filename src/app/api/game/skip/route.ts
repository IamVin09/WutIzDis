import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby } from '@/lib/redis'
import { pusherServer } from '@/lib/pusher-server'
import { WORDS } from '@/data/words'

export async function POST(req: NextRequest) {
  const { playerId, code } = await req.json()

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  if (lobby.status !== 'playing') return NextResponse.json({ ok: false })

  const currentGiverId = lobby.playerOrder[lobby.currentGiverIndex]
  if (playerId !== currentGiverId) return NextResponse.json({ error: 'Not the giver' }, { status: 403 })

  const wordIndex = lobby.wordOrder[lobby.currentWordPosition]
  const skippedWord = WORDS[wordIndex].target

  if (lobby.currentWordPosition < lobby.wordOrder.length - 1) {
    lobby.currentWordPosition += 1
  }
  await setLobby(lobby)

  await pusherServer.trigger(`taboo-${code}`, 'game:skipped', { skippedWord })

  return NextResponse.json({ ok: true })
}
