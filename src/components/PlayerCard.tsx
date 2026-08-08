type Props = {
  name: string
  avatar: string
  score?: number
  isHost?: boolean
  isGiver?: boolean
}

export function PlayerCard({ name, avatar, score, isHost, isGiver }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 bg-gray-800 rounded-xl p-3 min-w-[80px]">
      <span className="text-3xl">{avatar}</span>
      <span className="text-sm font-semibold text-white truncate max-w-[72px]">{name}</span>
      {isHost && <span className="text-xs bg-yellow-500 text-gray-900 rounded px-1">Host</span>}
      {isGiver && <span className="text-xs bg-indigo-500 rounded px-1">Describing</span>}
      {score !== undefined && (
        <span className="text-xs text-gray-400">{score} pt{score !== 1 ? 's' : ''}</span>
      )}
    </div>
  )
}
