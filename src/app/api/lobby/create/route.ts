import { NextRequest, NextResponse } from 'next/server'
import { getLobby, setLobby, type LobbyState } from '@/lib/redis'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  const { playerId, name, avatar } = await req.json()

  if (!playerId || !name || !avatar) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  let code = generateCode()
  // Avoid collision (rare but possible)
  for (let i = 0; i < 5; i++) {
    const existing = await getLobby(code)
    if (!existing) break
    code = generateCode()
  }

  const state: LobbyState = {
    code,
    status: 'waiting',
    hostId: playerId,
    players: [{ id: playerId, name, avatar, score: 0 }],
    playerOrder: [],
    currentGiverIndex: 0,
    wordOrder: [],
    currentWordPosition: 0,
    turnStartTime: null,
    turnEndTime: null,
    leaderboardEndTime: null,
  }

  await setLobby(state)
  return NextResponse.json({ code })
}
