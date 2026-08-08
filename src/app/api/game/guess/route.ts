import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby } from '@/lib/redis'
import { pusherServer } from '@/lib/pusher-server'
import { WORDS } from '@/data/words'

export async function POST(req: NextRequest) {
  const { playerId, code, guess } = await req.json()

  if (!playerId || !code || !guess) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const lobby = await getLobby(code)
  if (!lobby) return NextResponse.json({ error: 'Lobby not found' }, { status: 404 })
  if (lobby.status !== 'playing') return NextResponse.json({ ok: false, reason: 'not_playing' })

  const currentGiverId = lobby.playerOrder[lobby.currentGiverIndex]
  if (playerId === currentGiverId) return NextResponse.json({ ok: false, reason: 'giver_cannot_guess' })

  // Check timer
  if (lobby.turnEndTime && Date.now() > lobby.turnEndTime) {
    return NextResponse.json({ ok: false, reason: 'time_up' })
  }

  const wordIndex = lobby.wordOrder[lobby.currentWordPosition]
  const word = WORDS[wordIndex]

  if (guess.trim().toLowerCase() !== word.target.toLowerCase()) {
    return NextResponse.json({ ok: false, reason: 'wrong' })
  }

  // Correct guess — award point and advance word
  const guesser = lobby.players.find((p) => p.id === playerId)
  if (!guesser) return NextResponse.json({ ok: false, reason: 'unknown_player' })

  guesser.score += 1
  lobby.currentWordPosition += 1

  await setLobby(lobby)

  const scores = lobby.players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score }))

  await pusherServer.trigger(`taboo-${code}`, 'game:correct-guess', {
    guesserId: playerId,
    guesserName: guesser.name,
    revealedWord: word.target,
    scores,
  })

  return NextResponse.json({ ok: true })
}
