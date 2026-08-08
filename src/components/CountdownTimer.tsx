'use client'

import { useEffect, useState } from 'react'

type Props = {
  endTime: number | null
  onExpire?: () => void
}

export function CountdownTimer({ endTime, onExpire }: Props) {
  const [seconds, setSeconds] = useState<number>(0)

  useEffect(() => {
    if (!endTime) return

    const update = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining === 0) onExpire?.()
    }

    update()
    const id = setInterval(update, 500)
    return () => clearInterval(id)
  }, [endTime, onExpire])

  const isLow = seconds <= 30
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div
      className={`text-5xl font-mono font-bold tabular-nums transition-colors ${
        isLow ? 'text-red-400' : 'text-white'
      }`}
    >
      {mins}:{secs.toString().padStart(2, '0')}
    </div>
  )
}
