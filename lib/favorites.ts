export async function getFavorites(): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('favorites');
  return stored ? JSON.parse(stored) : [];
}

export async function toggleFavorite(noteId: string): Promise<string[]> {
  const favorites = await getFavorites();
  const exists = favorites.includes(noteId);
  
  const newFavorites = exists 
    ? favorites.filter(id => id !== noteId)
    : [...favorites, noteId];
    
  localStorage.setItem('favorites', JSON.stringify(newFavorites));
  return newFavorites;
}

export async function getLastViewed(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('lastViewed');
  return stored ? JSON.parse(stored) : {};
}

export async function updateLastViewed(noteId: string): Promise<void> {
  const lastViewed = await getLastViewed();
  lastViewed[noteId] = new Date().toISOString();
  localStorage.setItem('lastViewed', JSON.stringify(lastViewed));
}

export { getStreak, updateStreak } from './streak'; 