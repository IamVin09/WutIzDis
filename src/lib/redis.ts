import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = Redis.fromEnv()
  }
  return _redis
}

export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedis()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export type Player = {
  id: string
  name: string
  avatar: string
  score: number
}

export type LobbyState = {
  code: string
  status: 'waiting' | 'playing' | 'turn_end' | 'ended'
  hostId: string
  players: Player[]
  playerOrder: string[]
  currentGiverIndex: number
  wordOrder: number[]
  currentWordPosition: number
  turnStartTime: number | null
  turnEndTime: number | null
  leaderboardEndTime: number | null
  maxGivers?: number
}

const TTL_SECONDS = 60 * 60 * 24 // 24 hours

export async function getLobby(code: string): Promise<LobbyState | null> {
  return redis.get<LobbyState>(`lobby:${code}`)
}

export async function setLobby(state: LobbyState): Promise<void> {
  await redis.set(`lobby:${state.code}`, state, { ex: TTL_SECONDS })
}

export async function deleteLobby(code: string): Promise<void> {
  await redis.del(`lobby:${code}`)
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
