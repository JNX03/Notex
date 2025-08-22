'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Timer, 
  Coffee,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { updateStats } from '@/lib/stats';

interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  type: 'study' | 'break';
  completed: boolean;
}

interface StudyTimerProps {
  onSessionComplete?: (session: StudySession) => void;
}

export function StudyTimer({ onSessionComplete }: StudyTimerProps) {
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [sessionType, setSessionType] = useState<'study' | 'break'>('study');
  
  // Settings state
  const [studyDuration, setStudyDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Session tracking
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Load saved settings and stats on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('studyTimerSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setStudyDuration(settings.studyDuration || 25);
        setShortBreakDuration(settings.shortBreakDuration || 5);
        setLongBreakDuration(settings.longBreakDuration || 15);
        setSessionsUntilLongBreak(settings.sessionsUntilLongBreak || 4);
        setSoundEnabled(settings.soundEnabled ?? true);
      }

      const savedStats = localStorage.getItem('studyTimerStats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setCompletedSessions(stats.completedSessions || 0);
        setTotalStudyTime(stats.totalStudyTime || 0);
        setCurrentStreak(stats.currentStreak || 0);
      }

      // Reset timer to current study duration
      setTimeLeft(studyDuration * 60);
    }
  }, [studyDuration]);

  // Save settings when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const settings = {
        studyDuration,
        shortBreakDuration,
        longBreakDuration,
        sessionsUntilLongBreak,
        soundEnabled
      };
      localStorage.setItem('studyTimerSettings', JSON.stringify(settings));
    }
  }, [studyDuration, shortBreakDuration, longBreakDuration, sessionsUntilLongBreak, soundEnabled]);

  // Save stats when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stats = {
        completedSessions,
        totalStudyTime,
        currentStreak
      };
      localStorage.setItem('studyTimerStats', JSON.stringify(stats));
    }
  }, [completedSessions, totalStudyTime, currentStreak]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Use setTimeout to avoid state update during render
            setTimeout(() => {
              handleSessionComplete();
            }, 10);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, handleSessionComplete]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = sessionType === 'study' ? 800 : 400;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    }
  }, [soundEnabled, sessionType]);

  const handleSessionComplete = useCallback(() => {
    playNotificationSound();
    setIsRunning(false);
    
    if (currentSession) {
      const completedSession: StudySession = {
        ...currentSession,
        endTime: new Date(),
        duration: currentSession.duration - timeLeft,
        completed: true
      };

      // Update stats
      if (sessionType === 'study') {
        setCompletedSessions(prev => prev + 1);
        setTotalStudyTime(prev => prev + completedSession.duration);
        setCurrentStreak(prev => prev + 1);
        
        // Update global stats
        updateStats('Study Session', completedSession.duration);
      }

      onSessionComplete?.(completedSession);
      
      // Auto-switch to break or next study session
      const shouldTakeLongBreak = (completedSessions + 1) % sessionsUntilLongBreak === 0;
      if (sessionType === 'study') {
        const breakDuration = shouldTakeLongBreak ? longBreakDuration : shortBreakDuration;
        startBreakSession(breakDuration);
      } else {
        startStudySession();
      }
    }
  }, [currentSession, sessionType, timeLeft, completedSessions, sessionsUntilLongBreak, longBreakDuration, shortBreakDuration, onSessionComplete, playNotificationSound]);

  const startStudySession = () => {
    const duration = studyDuration * 60;
    setTimeLeft(duration);
    setSessionType('study');
    setCurrentSession({
      id: Date.now().toString(),
      startTime: new Date(),
      duration,
      type: 'study',
      completed: false
    });
  };

  const startBreakSession = (duration: number) => {
    const breakDuration = duration * 60;
    setTimeLeft(breakDuration);
    setSessionType('break');
    setCurrentSession({
      id: Date.now().toString(),
      startTime: new Date(),
      duration: breakDuration,
      type: 'break',
      completed: false
    });
  };

  const handleStart = () => {
    if (!currentSession) {
      startStudySession();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentSession(null);
    setTimeLeft(studyDuration * 60);
    setSessionType('study');
  };

  const handleReset = () => {
    setIsRunning(false);
    const duration = sessionType === 'study' ? studyDuration : 
      (completedSessions % sessionsUntilLongBreak === 0 ? longBreakDuration : shortBreakDuration);
    setTimeLeft(duration * 60);
    
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        startTime: new Date(),
        duration: duration * 60
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentSession ? 
    ((currentSession.duration - timeLeft) / currentSession.duration) * 100 : 0;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center justify-center">
          {sessionType === 'study' ? (
            <>
              <Timer className="h-5 w-5 text-blue-500" />
              Study Session
            </>
          ) : (
            <>
              <Coffee className="h-5 w-5 text-green-500" />
              Break Time
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timer" className="space-y-4">
            {/* Timer Display */}
            <div className="text-center space-y-4">
              <div className={`text-6xl font-mono font-bold ${
                sessionType === 'study' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {formatTime(timeLeft)}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress 
                  value={progress} 
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-2">
              {!isRunning ? (
                <Button onClick={handleStart} size="lg" className="gap-2">
                  <Play className="h-4 w-4" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              
              <Button onClick={handleStop} size="lg" variant="outline" className="gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
              
              <Button onClick={handleReset} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Session Info */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Session {completedSessions + 1}</p>
              {sessionType === 'study' && completedSessions > 0 && (
                <p>
                  Next: {(completedSessions + 1) % sessionsUntilLongBreak === 0 ? 'Long' : 'Short'} Break
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{completedSessions}</div>
                <div className="text-sm text-muted-foreground">Completed Sessions</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(totalStudyTime / 3600 * 10) / 10}h
                </div>
                <div className="text-sm text-muted-foreground">Study Time</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {completedSessions > 0 ? Math.round(totalStudyTime / completedSessions / 60) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Session (min)</div>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                setCompletedSessions(0);
                setTotalStudyTime(0);
                setCurrentStreak(0);
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Reset Stats
            </Button>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="study-duration">Study Duration (minutes)</Label>
                <Input
                  id="study-duration"
                  type="number"
                  min="1"
                  max="120"
                  value={studyDuration}
                  onChange={(e) => setStudyDuration(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="short-break">Short Break (minutes)</Label>
                <Input
                  id="short-break"
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="long-break">Long Break (minutes)</Label>
                <Input
                  id="long-break"
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessions-until-long">Sessions Until Long Break</Label>
                <Input
                  id="sessions-until-long"
                  type="number"
                  min="2"
                  max="10"
                  value={sessionsUntilLongBreak}
                  onChange={(e) => setSessionsUntilLongBreak(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound-toggle">Sound Notifications</Label>
                <Button
                  id="sound-toggle"
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="gap-2"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      On
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Off
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}