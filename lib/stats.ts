interface Stats {
    totalNotes: number;
    studyHours: number;
    lastViewed: {
      title: string;
      timestamp: string;
    } | null;
    streak: number;
  }
  
  export function getStats(): Stats {
    if (typeof window === 'undefined') {
      return {
        totalNotes: 0,
        studyHours: 0,
        lastViewed: null,
        streak: 0
      };
    }
  
    const notes: Array<{ title: string; content: string }> = JSON.parse(localStorage.getItem('notes') || '[]');
    const totalNotes = notes.length;
  
    const sessions: Array<{ duration: number; timestamp: string }> = JSON.parse(localStorage.getItem('studySessions') || '[]');
    const studyHours = sessions.reduce((total, session) => total + (session.duration || 0) / 3600, 0);
  
    const lastViewed: Record<string, string> = JSON.parse(localStorage.getItem('lastViewed') || '{}');
    const lastViewedEntry = Object.entries(lastViewed)
      .sort(([, a], [, b]) => new Date(b).getTime() - new Date(a).getTime())[0];
  
    const streakData: { currentStreak: number } = JSON.parse(localStorage.getItem('studyStreak') || '{"currentStreak": 0}');
  
    const stats: Stats = {
      totalNotes,
      studyHours: Number(studyHours.toFixed(1)),
      lastViewed: lastViewedEntry ? {
        title: lastViewedEntry[0],
        timestamp: String(lastViewedEntry[1])
      } : null,
      streak: streakData.currentStreak || 0
    };
  
    localStorage.setItem('userStats', JSON.stringify(stats));
  
    return stats;
  }
  
  export function updateStats(noteTitle: string, studyDuration: number): Stats {
    const stats = getStats();
    const now = new Date();
  
    const lastViewed = {
      title: noteTitle,
      timestamp: now.toISOString()
    };
    stats.lastViewed = lastViewed;
  
    const sessions: Array<{ noteTitle: string; duration: number; timestamp: string }> = JSON.parse(localStorage.getItem('studySessions') || '[]');
    sessions.push({
      noteTitle,
      duration: studyDuration,
      timestamp: now.toISOString()
    });
    localStorage.setItem('studySessions', JSON.stringify(sessions));
  
    const lastDate = stats.lastViewed?.timestamp
      ? new Date(stats.lastViewed.timestamp).toDateString()
      : null;
  
    if (lastDate !== now.toDateString()) {
      stats.streak += 1;
      localStorage.setItem('studyStreak', JSON.stringify({
        lastStudyDate: now.toISOString(),
        currentStreak: stats.streak
      }));
    }
  
    localStorage.setItem('userStats', JSON.stringify(stats));
    window.dispatchEvent(new Event('storage'));
  
    return stats;
  }
  
  export function initializeStats(totalNotes: number): void {
    const stats = getStats();
    if (stats.totalNotes !== totalNotes) {
      stats.totalNotes = totalNotes;
      localStorage.setItem('userStats', JSON.stringify(stats));
      window.dispatchEvent(new Event('storage'));
    }
  }
  