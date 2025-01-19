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

  // Get stored stats
  const stored = localStorage.getItem('userStats');
  
  // Calculate total notes
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const totalNotes = notes.length;

  // Calculate study hours from stored study sessions
  const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
  const studyHours = sessions.reduce((total: number, session: any) => 
    total + (session.duration || 0) / 3600, 0);

  // Get last viewed note
  const lastViewed = JSON.parse(localStorage.getItem('lastViewed') || '{}');
  const lastViewedEntry = Object.entries(lastViewed)
    .sort(([,a]: any, [,b]: any) => new Date(b).getTime() - new Date(a).getTime())[0];

  // Calculate streak
  const streakData = JSON.parse(localStorage.getItem('studyStreak') || '{"currentStreak": 0}');

  const stats = {
    totalNotes,
    studyHours: Number(studyHours.toFixed(1)),
    lastViewed: lastViewedEntry ? {
      title: lastViewedEntry[0],
      timestamp: lastViewedEntry[1]
    } : null,
    streak: streakData.currentStreak || 0
  };

  // Update stored stats
  localStorage.setItem('userStats', JSON.stringify(stats));
  
  return stats;
}

export function updateStats(noteTitle: string, studyDuration: number) {
  const stats = getStats();
  const now = new Date();

  // Update last viewed
  const lastViewed = {
    title: noteTitle,
    timestamp: now.toISOString()
  };
  stats.lastViewed = lastViewed;

  // Update study hours
  const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
  sessions.push({
    noteTitle,
    duration: studyDuration,
    timestamp: now.toISOString()
  });
  localStorage.setItem('studySessions', JSON.stringify(sessions));

  // Update streak
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

  // Save stats
  localStorage.setItem('userStats', JSON.stringify(stats));
  window.dispatchEvent(new Event('storage'));

  return stats;
}

export function initializeStats(totalNotes: number) {
  const stats = getStats();
  if (stats.totalNotes !== totalNotes) {
    stats.totalNotes = totalNotes;
    localStorage.setItem('userStats', JSON.stringify(stats));
    window.dispatchEvent(new Event('storage'));
  }
} 