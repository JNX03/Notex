export function getStreak(): number {
  if (typeof window === 'undefined') return 0;
  
  const streakData = localStorage.getItem('studyStreak');
  if (!streakData) return 0;

  const { lastStudyDate, currentStreak } = JSON.parse(streakData);
  const lastDate = new Date(lastStudyDate);
  const today = new Date();
  
  // Reset streak if more than a day has passed
  if (today.getDate() - lastDate.getDate() > 1) {
    localStorage.setItem('studyStreak', JSON.stringify({
      lastStudyDate: today.toISOString(),
      currentStreak: 1
    }));
    return 1;
  }

  return currentStreak;
}

export function updateStreak() {
  if (typeof window === 'undefined') return;
  
  const today = new Date();
  const streakData = localStorage.getItem('studyStreak');
  
  if (!streakData) {
    localStorage.setItem('studyStreak', JSON.stringify({
      lastStudyDate: today.toISOString(),
      currentStreak: 1
    }));
    return 1;
  }

  const { lastStudyDate, currentStreak } = JSON.parse(streakData);
  const lastDate = new Date(lastStudyDate);
  
  // Only update if it's a new day
  if (today.getDate() !== lastDate.getDate()) {
    localStorage.setItem('studyStreak', JSON.stringify({
      lastStudyDate: today.toISOString(),
      currentStreak: currentStreak + 1
    }));
    return currentStreak + 1;
  }

  return currentStreak;
} 