'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"

interface CountdownProps {
  targetDate: string
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      } else {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold">{timeLeft.days}</div>
            <div className="text-xs">Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{timeLeft.hours}</div>
            <div className="text-xs">Hours</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{timeLeft.minutes}</div>
            <div className="text-xs">Minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{timeLeft.seconds}</div>
            <div className="text-xs">Seconds</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

