import { NextRequest, NextResponse } from 'next/server'
import { getLobby } from '@/lib/redis'
import { WORDS } from '@/data/words'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const playerId = searchParams.get('playerId')
  const code = searchParams.get('code')

  if (!playerId || !code) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })

  const currentGiverId = lobby.playerOrder[lobby.currentGiverIndex]
  if (playerId !== currentGiverId) return NextResponse.json({ error: 'Not the giver' }, { status: 403 })

  const wordIndex = lobby.wordOrder[lobby.currentWordPosition]
  const word = WORDS[wordIndex]

  return NextResponse.json({ target: word.target, taboo: word.taboo })
}
