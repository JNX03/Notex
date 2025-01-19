"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'update';
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed));
    }

    // In a real app, fetch from API
    setAnnouncements([
      {
        id: '1',
        title: 'New Chemistry Notes Available',
        content: 'Check out the new Chemistry notes for Chapter 4!',
        date: '2024-01-15',
        type: 'update'
      },
      {
        id: '2',
        title: 'Scheduled Maintenance',
        content: 'The site will be under maintenance on Sunday, 2 AM - 4 AM',
        date: '2024-01-20',
        type: 'warning'
      }
    ]);
  }, []);

  const dismissAnnouncement = (id: string) => {
    const newDismissed = [...dismissedAnnouncements, id];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  const visibleAnnouncements = announcements.filter(
    a => !dismissedAnnouncements.includes(a.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => (
        <Card 
          key={announcement.id}
          className={cn(
            "border-l-4",
            announcement.type === 'warning' && "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950",
            announcement.type === 'info' && "border-l-blue-500 bg-blue-50 dark:bg-blue-950",
            announcement.type === 'update' && "border-l-green-500 bg-green-50 dark:bg-green-950"
          )}
        >
          <CardContent className="flex items-start justify-between p-4">
            <div className="flex gap-2">
              <Bell className="h-5 w-5 mt-0.5" />
              <div>
                <h4 className="font-semibold">{announcement.title}</h4>
                <p className="text-sm text-muted-foreground">{announcement.content}</p>
                <time className="text-xs text-muted-foreground">{announcement.date}</time>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => dismissAnnouncement(announcement.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 