"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "./mode-toggle"
import { Mail, Home, Book, BookOpen, Calendar, Settings, HelpCircle } from "lucide-react"
import { SettingsDialog } from "./settings-dialog"
import { HelpDialog } from "./help-dialog"

export function AppSidebar() {
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const mainNav = [
    { title: "Home", icon: Home, href: "/" },
    { title: "Notes", icon: Book, href: "/notes" },
    { title: "Study Plans", icon: Calendar, href: "/plans" },
    { title: "Resources", icon: BookOpen, href: "/resources" },
  ]

  return (
    <>
      <div className="fixed top-0 left-0 z-30 flex h-screen w-56 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-bold">NoteX</span>
        </div>
        
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 py-2">
            {mainNav.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                className="w-full justify-start gap-2"
                asChild
              >
                <a href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </a>
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4 space-y-2">
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
          <ModeToggle />
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