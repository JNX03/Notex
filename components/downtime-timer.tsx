'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DowntimeTimerProps {
  startDate: string 
}

const DowntimeTimer: React.FC<DowntimeTimerProps> = ({ startDate }) => {
  const [timeElapsed, setTimeElapsed] = useState('')

  useEffect(() => {
    const midnight = new Date(startDate)
    midnight.setHours(0, 0, 0, 0)

    const timer = setInterval(() => {
      const now = new Date()
      const difference = now.getTime() - midnight.getTime()

      if (difference < 0) {
        setTimeElapsed('0d 0h 0m 0s')
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeElapsed(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [startDate])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downtime Duration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{timeElapsed}</p>
      </CardContent>
    </Card>
  )
}

export default DowntimeTimer
