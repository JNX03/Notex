"use client";

import React, { Suspense, useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { NotesList } from "@/components/notes-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, TrendingUp, Activity } from "lucide-react";
import { getStats } from "@/lib/stats";
// import { AnnouncementBanner } from "@/components/announcement-banner";

export default function Home() {
  const [stats, setStats] = useState(getStats());

  // Update stats when they change
  useEffect(() => {
    const updateStats = () => {
      setStats(getStats());
    };

    // Update every second
    const interval = setInterval(updateStats, 1000);
    window.addEventListener('storage', updateStats);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateStats);
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome to NoteX</h1>
          <p className="text-sm text-muted-foreground">Track your study progress and manage your notes</p>
        </div>
        <ModeToggle />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Notes */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalNotes}</div>
          </CardContent>
        </Card>

        {/* Study Hours */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.studyHours.toFixed(1)}</div>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.streak} days</div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.lastViewed ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last viewed:</p>
                <p className="text-sm font-medium truncate">{stats.lastViewed.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(stats.lastViewed.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes Tabs */}
      <div className="rounded-lg border bg-card">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex overflow-auto p-2">
            <TabsList className="flex-1 grid grid-cols-3 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm py-2">All Notes</TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs sm:text-sm py-2">Favorites</TabsTrigger>
              <TabsTrigger value="recent" className="text-xs sm:text-sm py-2">Recent</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-2 sm:p-4">
            <TabsContent value="all">
              <Suspense fallback={<div>Loading notes...</div>}>
                <NotesList />
              </Suspense>
            </TabsContent>
            <TabsContent value="favorites">
              <Suspense fallback={<div>Loading favorites...</div>}>
                <NotesList filterFavorites />
              </Suspense>
            </TabsContent>
            <TabsContent value="recent">
              <Suspense fallback={<div>Loading recent...</div>}>
                <NotesList filterRecent />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs sm:text-sm text-muted-foreground">
        <p>
          © 2024 NoteX - Developed with ❤️ by{" "}
          <a
            href="https://www.instagram.com/jxxn03z/"
            className="underline hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            @Jxxn03z
          </a>
        </p>
      </footer>
    </div>
  );
}
