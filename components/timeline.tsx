import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const timelineItems = [
  { title: 'AI Features', description: 'Integrating advanced AI capabilities' },
  { title: 'Video Content', description: 'Adding support for video lessons' },
  { title: 'Interactive Quizzes', description: 'Implementing engaging quiz features' },
  { title: 'Self-Learning Paths', description: 'Personalized learning journeys' },
]

const Timeline: React.FC = () => {
  return (
    <Card className="w-full bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Coming Soon (Roadmap)</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-muted-foreground">
          {timelineItems.map((item, index) => (
            <li key={index} className="mb-10 ml-4">
              <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -left-1.5 border border-background"></div>
              <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
              <p className="mb-4 text-base font-normal text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export default Timeline
