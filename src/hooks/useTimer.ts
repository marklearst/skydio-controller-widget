import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Options for configuring the useTimer hook.
 *
 * @property duration - The timer duration in seconds (default: 0)
 * @property state - The timer state, either 'running' or 'paused' (default: 'running')
 * @property onComplete - Optional callback invoked when timer reaches 0
 * @property progressOverride - Optional override for progress value (0-1)
 */
export interface UseTimerOptions {
  duration?: number
  state?: 'running' | 'paused'
  onComplete?: () => void
  progressOverride?: number
}

/**
 * Custom React hook for creating a countdown timer with progress and reset functionality.
 *
 * @param options - Configuration options for the timer (see UseTimerOptions)
 * @returns An object with remaining time, progress, reset function, and setRemaining function.
 *
 * @example
 * const { remaining, progress, reset } = useTimer({ duration: 60, state: 'running' })
 */
export function useTimer({
  duration = 0,
  state = 'running',
  onComplete,
  progressOverride,
}: UseTimerOptions) {
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.min(duration, 3599))
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync duration prop
  useEffect(() => {
    setRemaining(Math.max(0, Math.min(duration, 3599)))
  }, [duration])

  // Countdown effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (state === 'running' && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!)
            if (onComplete) onComplete()
            return 0
          }
          // Clamp to [0, 3599]
          return Math.max(0, Math.min(r - 1, 3599))
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state, remaining, onComplete])

  // Progress calculation
  let progress =
    duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 1
  if (typeof progressOverride === 'number' && !isNaN(progressOverride)) {
    progress = Math.max(0, Math.min(1, progressOverride))
  }

  // Reset timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setRemaining(Math.max(0, Math.min(duration, 3599)))
  }, [duration])

  return {
    remaining,
    progress,
    reset,
    setRemaining,
  }
}
