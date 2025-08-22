"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { ModeToggle } from "./mode-toggle"
import { 
  Home, 
  Book, 
  BookOpen, 
  Calendar, 
  Settings, 
  HelpCircle, 
  Timer, 
  Brain, 
  Trophy, 
  TrendingUp,
  Target,
  Zap,
  Star,
  Clock
} from "lucide-react"
import { SettingsDialog } from "./settings-dialog"
import { HelpDialog } from "./help-dialog"
import { getStats } from "@/lib/stats"

export function AppSidebar() {
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')
  const stats = getStats()

  const mainNav = [
    { title: "Dashboard", icon: Home, href: "/", description: "Overview & quick actions" },
    { title: "Study Timer", icon: Timer, href: "/#timer", description: "Pomodoro & focus sessions" },
    { title: "Flashcards", icon: Brain, href: "/#flashcards", description: "Spaced repetition learning" },
    { title: "Quizzes", icon: Trophy, href: "/#quizzes", description: "Test your knowledge" },
    { title: "Notes", icon: Book, href: "/notes", description: "Manage study materials" },
    { title: "Study Plans", icon: Calendar, href: "/plans", description: "Structured learning paths" },
    { title: "Resources", icon: BookOpen, href: "/resources", description: "External materials" },
  ]
  
  const quickStats = [
    { label: "Study Hours", value: stats.studyHours.toFixed(1), icon: Clock, color: "text-blue-600" },
    { label: "Study Streak", value: `${stats.streak}`, icon: TrendingUp, color: "text-green-600" },
    { label: "Total Notes", value: `${stats.totalNotes}`, icon: Book, color: "text-purple-600" },
  ]

  return (
    <>
      <div className="fixed top-0 left-0 z-30 flex h-screen w-56 flex-col border-r bg-background shadow-lg lg:translate-x-0 -translate-x-full transition-transform duration-300">
        <div className="flex h-14 items-center border-b px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <span className="font-bold text-white text-lg">NoteX</span>
          <span className="ml-auto text-xs text-blue-100">v2.0</span>
        </div>
        
        <ScrollArea className="flex-1 px-2">
          {/* Quick Stats */}
          <div className="py-4 space-y-3">
            <div className="px-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Today's Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>Study Goal</span>
                  <span className="font-medium">{Math.min(stats.studyHours / 2 * 100, 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(stats.studyHours / 2 * 100, 100)} className="h-1" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 px-2">
              {quickStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <stat.icon className={`h-3 w-3 ${stat.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{stat.value}</div>
                    <div className="text-xs text-muted-foreground truncate">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t mx-2 mb-4"></div>
          
          {/* Navigation */}
          <div className="space-y-1 py-2">
            <div className="px-2 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Learning Tools
              </h3>
            </div>
            {mainNav.map((item) => (
              <div key={item.title} className="px-2">
                <Button
                  variant={currentPath === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-auto py-2 px-3",
                    currentPath === item.href && "bg-primary/10 text-primary"
                  )}
                  asChild
                >
                  <a 
                    href={item.href}
                    onClick={() => setCurrentPath(item.href)}
                    className="flex flex-col items-start"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 leading-tight">
                      {item.description}
                    </span>
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="border-t p-4 space-y-2">
          {/* Achievement Badge */}
          {stats.streak >= 7 && (
            <div className="mb-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    Week Warrior!
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    {stats.streak} day streak
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2"
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
          <div className="pt-2">
            <ModeToggle />
          </div>
        </div>
      </div>

      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
      <HelpDialog 
        open={showHelp} 
        onOpenChange={setShowHelp} 
      />
    </>
  )
} 