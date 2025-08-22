"use client";

import React, { Suspense, useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { NotesList } from "@/components/notes-list";
import { StudyTimer } from "@/components/study-timer";
import { FlashcardSystem } from "@/components/flashcard-system";
import { QuizSystem } from "@/components/quiz-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, TrendingUp, Activity, Timer, Brain, Trophy, Target, Zap } from "lucide-react";
import { getStats } from "@/lib/stats";

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
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to NoteX
          </h1>
          <p className="text-sm text-muted-foreground">Your comprehensive learning companion with smart study tools</p>
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

      {/* Main Learning Hub */}
      <div className="rounded-lg border bg-card">
        <Tabs defaultValue="notes" className="w-full">
          <div className="flex overflow-auto p-2">
            <TabsList className="flex-1 grid grid-cols-6 h-auto">
              <TabsTrigger value="notes" className="text-xs sm:text-sm py-2 gap-1 font-semibold">
                <BookOpen className="h-4 w-4" />
                📚 Notes
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm py-2 gap-1">
                <Target className="h-3 w-3" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="timer" className="text-xs sm:text-sm py-2 gap-1">
                <Timer className="h-3 w-3" />
                Study Timer
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="text-xs sm:text-sm py-2 gap-1">
                <Brain className="h-3 w-3" />
                Flashcards
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="text-xs sm:text-sm py-2 gap-1">
                <Trophy className="h-3 w-3" />
                Quizzes
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 gap-1">
                <Zap className="h-3 w-3" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-2 sm:p-4">
            <TabsContent value="dashboard" className="space-y-6">
              {/* Featured Notes Section */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    📚 Your Study Notes
                    <span className="ml-auto text-sm font-normal text-muted-foreground">
                      {stats.totalNotes} notes available
                    </span>
                  </CardTitle>
                  <p className="text-muted-foreground">Access your comprehensive collection of study materials and resources</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Suspense fallback={<div>Loading featured notes...</div>}>
                        {stats.totalNotes > 0 ? (
                          <NotesList filterRecent limit={4} />
                        ) : (
                          <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="font-semibold text-muted-foreground mb-2">No Notes Yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Start building your study collection! Your notes will appear here.
                            </p>
                            <Button variant="outline" size="sm">
                              📁 Browse Available PDFs
                            </Button>
                          </div>
                        )}
                      </Suspense>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Study Tips</h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Review notes regularly for better retention</li>
                          <li>• Use the study timer while reading</li>
                          <li>• Create flashcards from key concepts</li>
                          <li>• Test yourself with quizzes</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full" asChild>
                          <a href="#notes">📖 Explore All Notes →</a>
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          {stats.totalNotes > 0 ? 
                            `${stats.totalNotes} comprehensive study materials ready for you` : 
                            'Start your learning journey with quality study materials'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Study Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📖 Study Tools</CardTitle>
                  <p className="text-muted-foreground">Enhance your learning with these interactive tools</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => document.querySelector('[value="timer"]')?.click()}>
                      <CardContent className="p-4 text-center">
                        <div className="mb-2 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg inline-block group-hover:scale-110 transition-transform">
                          <Timer className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold">Study Timer</h3>
                        <p className="text-xs text-muted-foreground">Focus with Pomodoro technique</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => document.querySelector('[value="flashcards"]')?.click()}>
                      <CardContent className="p-4 text-center">
                        <div className="mb-2 p-3 bg-purple-100 dark:bg-purple-900 rounded-lg inline-block group-hover:scale-110 transition-transform">
                          <Brain className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold">Flashcards</h3>
                        <p className="text-xs text-muted-foreground">Spaced repetition learning</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => document.querySelector('[value="quizzes"]')?.click()}>
                      <CardContent className="p-4 text-center">
                        <div className="mb-2 p-3 bg-green-100 dark:bg-green-900 rounded-lg inline-block group-hover:scale-110 transition-transform">
                          <Trophy className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold">Quizzes</h3>
                        <p className="text-xs text-muted-foreground">Test your knowledge</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Today's Learning Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Study 2 hours today</span>
                      <span className="text-sm font-medium">{stats.studyHours.toFixed(1)}/2.0 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((stats.studyHours / 2) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.studyHours >= 2 ? '🎉 Goal achieved!' : `${(2 - stats.studyHours).toFixed(1)} hours remaining`}
                    </div>
                  </div>
                </CardContent>
              </Card>

            </TabsContent>
            
            <TabsContent value="timer">
              <StudyTimer onSessionComplete={(session) => {
                console.log('Study session completed:', session);
              }} />
            </TabsContent>
            
            <TabsContent value="flashcards">
              <FlashcardSystem />
            </TabsContent>
            
            <TabsContent value="quizzes">
              <QuizSystem />
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    📚 Study Notes Collection
                  </h2>
                  <p className="text-muted-foreground">Your comprehensive library of study materials and resources</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {stats.totalNotes} Total Notes
                  </span>
                </div>
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <div className="flex overflow-auto">
                  <TabsList className="flex-1 grid grid-cols-3 h-auto">
                    <TabsTrigger value="all" className="text-xs sm:text-sm py-3 gap-2">
                      <BookOpen className="h-4 w-4" />
                      All Notes
                    </TabsTrigger>
                    <TabsTrigger value="favorites" className="text-xs sm:text-sm py-3 gap-2">
                      <Activity className="h-4 w-4" />
                      Favorites
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="text-xs sm:text-sm py-3 gap-2">
                      <Clock className="h-4 w-4" />
                      Recent
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="mt-6">
                  <TabsContent value="all">
                    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-pulse">Loading all notes...</div></div>}>
                      <NotesList />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="favorites">
                    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-pulse">Loading favorites...</div></div>}>
                      <NotesList filterFavorites />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="recent">
                    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-pulse">Loading recent notes...</div></div>}>
                      <NotesList filterRecent />
                    </Suspense>
                  </TabsContent>
                </div>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.studyHours.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Total Study Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.streak}</div>
                        <div className="text-sm text-muted-foreground">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats.totalNotes}</div>
                        <div className="text-sm text-muted-foreground">Notes Created</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">85%</div>
                        <div className="text-sm text-muted-foreground">Avg Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="flex items-center gap-4">
                          <div className="w-12 text-sm font-medium">{day}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.random() * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-muted-foreground w-16 text-right">
                            {(Math.random() * 3).toFixed(1)}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs sm:text-sm text-muted-foreground">
        <p>
          © 2025 NoteX - Your Learning Companion | Developed with ❤️ by{" "}
          <a
            href="https://www.instagram.com/jxxn03z/"
            className="underline hover:text-primary transition-colors"
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
