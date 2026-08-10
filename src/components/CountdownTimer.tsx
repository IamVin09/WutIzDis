'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  endTime: number | null
  clockOffset?: number
  onExpire?: () => void
}

export function CountdownTimer({ endTime, clockOffset = 0, onExpire }: Props) {
  const [seconds, setSeconds] = useState<number>(0)
  const hasFiredRef = useRef(false)

  useEffect(() => {
    hasFiredRef.current = false
    if (!endTime) return

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - (Date.now() + clockOffset)) / 1000))
      setSeconds(remaining)
      if (remaining === 0 && !hasFiredRef.current) {
        hasFiredRef.current = true
        onExpire?.()
      }
    }

    tick()
    const id = setInterval(tick, 500)
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [endTime, clockOffset, onExpire])

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
