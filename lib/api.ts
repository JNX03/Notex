import { notes } from "@/components/notes-list";

export async function getNotes() {
  // In a real app, this would fetch from an API
  return notes;
}

export async function getFavorites() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('favorites');
  return stored ? JSON.parse(stored) : [];
}

export async function toggleFavorite(noteId: string) {
  const favorites = await getFavorites();
  const exists = favorites.includes(noteId);
  
  const newFavorites = exists 
    ? favorites.filter((id: string) => id !== noteId)
    : [...favorites, noteId];
    
  localStorage.setItem('favoriteNotes', JSON.stringify(newFavorites));
  return newFavorites;
}

export async function getLastViewed() {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('lastViewed');
  return stored ? JSON.parse(stored) : {};
}

export async function updateLastViewed(noteId: string) {
  const lastViewed = await getLastViewed();
  lastViewed[noteId] = new Date().toISOString();
  localStorage.setItem('lastViewed', JSON.stringify(lastViewed));
} 