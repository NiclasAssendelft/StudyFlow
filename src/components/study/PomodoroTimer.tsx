'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type TimerPhase = 'focus' | 'break' | 'long_break' | 'idle'

interface PomodoroTimerProps {
  focusMinutes?: number
  breakMinutes?: number
  longBreakMinutes?: number
  sessionsBeforeLongBreak?: number
  topicName?: string
  onSessionComplete?: (sessionNumber: number) => void
  onTimerEnd?: () => void
}

export function PomodoroTimer({
  focusMinutes = 25,
  breakMinutes = 5,
  longBreakMinutes = 15,
  sessionsBeforeLongBreak = 4,
  topicName,
  onSessionComplete,
  onTimerEnd,
}: PomodoroTimerProps) {
  const [phase, setPhase] = useState<TimerPhase>('idle')
  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalTime =
    phase === 'focus'
      ? focusMinutes * 60
      : phase === 'break'
      ? breakMinutes * 60
      : phase === 'long_break'
      ? longBreakMinutes * 60
      : focusMinutes * 60

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        // Phase complete
        if (phase === 'focus') {
          const newCount = completedSessions + 1
          setCompletedSessions(newCount)
          onSessionComplete?.(newCount)

          // Determine next break
          if (newCount % sessionsBeforeLongBreak === 0) {
            setPhase('long_break')
            return longBreakMinutes * 60
          } else {
            setPhase('break')
            return breakMinutes * 60
          }
        } else {
          // Break over, start new focus
          setPhase('focus')
          return focusMinutes * 60
        }
      }
      return prev - 1
    })
  }, [
    phase,
    completedSessions,
    focusMinutes,
    breakMinutes,
    longBreakMinutes,
    sessionsBeforeLongBreak,
    onSessionComplete,
  ])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, tick])

  const start = () => {
    if (phase === 'idle') {
      setPhase('focus')
      setTimeLeft(focusMinutes * 60)
    }
    setIsRunning(true)
  }

  const pause = () => setIsRunning(false)

  const reset = () => {
    setIsRunning(false)
    setPhase('idle')
    setTimeLeft(focusMinutes * 60)
    setCompletedSessions(0)
  }

  const phaseLabels: Record<TimerPhase, string> = {
    focus: 'Keskity',
    break: 'Tauko',
    long_break: 'Pitkä tauko',
    idle: 'Valmis aloittamaan',
  }

  const phaseColors: Record<TimerPhase, string> = {
    focus: 'text-brand-600',
    break: 'text-green-600',
    long_break: 'text-emerald-600',
    idle: 'text-gray-600',
  }

  const breakMessages = [
    'Venyttele ja hengitä syvään',
    'Juo vettä!',
    'Kävele hetki',
    'Katso ikkunasta ulos',
    'Sulje silmäsi hetkeksi',
  ]

  return (
    <div className="bg-white border rounded-2xl p-8 text-center max-w-md mx-auto">
      {/* Topic label */}
      {topicName && phase === 'focus' && (
        <div className="text-sm text-gray-500 mb-2">Opiskelet: {topicName}</div>
      )}

      {/* Phase label */}
      <div className={`text-lg font-medium mb-2 ${phaseColors[phase]}`}>
        {phaseLabels[phase]}
      </div>

      {/* Timer display */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={phase === 'focus' ? '#3b82f6' : '#22c55e'}
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 tabular-nums">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Break message */}
      {(phase === 'break' || phase === 'long_break') && (
        <p className="text-sm text-green-700 mb-4">
          {breakMessages[completedSessions % breakMessages.length]}
        </p>
      )}

      {/* Session counter */}
      <div className="flex justify-center gap-1.5 mb-6">
        {Array.from({ length: sessionsBeforeLongBreak }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < completedSessions % sessionsBeforeLongBreak ||
              (completedSessions > 0 && completedSessions % sessionsBeforeLongBreak === 0 && i < sessionsBeforeLongBreak)
                ? 'bg-brand-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={start}
            className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            {phase === 'idle' ? 'Aloita' : 'Jatka'}
          </button>
        ) : (
          <button
            onClick={pause}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Tauko
          </button>
        )}
        {phase !== 'idle' && (
          <button
            onClick={reset}
            className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Nollaa
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 text-sm text-gray-500">
        {completedSessions > 0 && (
          <span>
            {completedSessions} sessiota suoritettu ({Math.round(completedSessions * focusMinutes / 60 * 10) / 10}h)
          </span>
        )}
      </div>
    </div>
  )
}
