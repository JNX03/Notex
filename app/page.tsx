'use client'

import React from 'react'
import { ModeToggle } from '@/components/mode-toggle'
import AnimatedBackground from '@/components/animated-background'
import Timeline from '@/components/timeline'
import DowntimeTimer from '@/components/downtime-timer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ExternalLink } from 'lucide-react'

export default function Home() {
  const downTime = '2025-01-07T00:00:00Z'
  const expectedCompletion = 'TBA'//'2025-01-20T00:00:00Z'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="container mx-auto p-4 min-h-screen flex flex-col justify-between relative z-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Notex</h1>
            <p className="text-sm text-muted-foreground">
              by{' '}
              <a
                href="https://www.instagram.com/jxxn03z/"
                className="underline hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                @Jxxn03z
              </a>
            </p>
          </div>
          <ModeToggle />
        </header>

        <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold mb-4">Website Under Maintenance</h2>
              <p className="text-xl mb-6">We&apos;re working hard to improve your experience</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Downtime Since</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{formatDate(downTime)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Expected Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">TBA</p>
                  {/* <p className="text-2xl font-semibold">{formatDate(expectedCompletion)}</p> */}
                </CardContent>
              </Card>
            </div>
            <DowntimeTimer startDate={downTime} />
            <div className="space-y-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="https://status.jnx03.xyz" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Check Status Page
                </a>
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <Timeline />
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  notex@jnx03.xyz
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            © 2024 NoteX - Developed with ❤️ by{' '}
            <a
              href="https://www.instagram.com/jxxn03z/"
              className="underline hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              @Jxxn03z
            </a>
            {' '}(Temporary disable)
          </p>
        </footer>
      </div>
    </div>
  )
}
