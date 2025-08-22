'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Shuffle, 
  BookOpen,
  Brain,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created: Date;
  lastReviewed?: Date;
  timesReviewed: number;
  correctCount: number;
  incorrectCount: number;
  easeFactor: number; // For spaced repetition
  nextReview: Date;
}

interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  totalTime: number;
}

export function FlashcardSystem() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [sessionStats, setSessionStats] = useState<StudySession | null>(null);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    category: '',
    difficulty: 'medium' as const
  });

  // Load flashcards on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flashcards');
      if (saved) {
        const parsed = JSON.parse(saved).map((card: any) => ({
          ...card,
          created: new Date(card.created),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
          nextReview: new Date(card.nextReview)
        }));
        setFlashcards(parsed);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(parsed.map((card: Flashcard) => card.category))];
        setCategories(uniqueCategories);
      } else {
        // Create demo flashcards if none exist
        const demoCards: Flashcard[] = [
          {
            id: 'demo-1',
            front: 'What is the capital of France?',
            back: 'Paris - The capital and most populous city of France, known for the Eiffel Tower and rich culture.',
            category: 'Geography',
            difficulty: 'easy',
            created: new Date(),
            timesReviewed: 0,
            correctCount: 0,
            incorrectCount: 0,
            easeFactor: 2.5,
            nextReview: new Date()
          },
          {
            id: 'demo-2',
            front: 'What does HTML stand for?',
            back: 'HyperText Markup Language - The standard markup language for creating web pages.',
            category: 'Programming',
            difficulty: 'medium',
            created: new Date(),
            timesReviewed: 0,
            correctCount: 0,
            incorrectCount: 0,
            easeFactor: 2.5,
            nextReview: new Date()
          },
          {
            id: 'demo-3',
            front: 'What is photosynthesis?',
            back: 'The process by which plants convert light energy into chemical energy (glucose) using carbon dioxide and water.',
            category: 'Biology',
            difficulty: 'medium',
            created: new Date(),
            timesReviewed: 0,
            correctCount: 0,
            incorrectCount: 0,
            easeFactor: 2.5,
            nextReview: new Date()
          }
        ];
        setFlashcards(demoCards);
        const uniqueCategories = [...new Set(demoCards.map(card => card.category))];
        setCategories(uniqueCategories);
      }
    }
  }, []);

  // Save flashcards when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && flashcards.length > 0) {
      localStorage.setItem('flashcards', JSON.stringify(flashcards));
      
      // Update categories
      const uniqueCategories = [...new Set(flashcards.map(card => card.category))];
      setCategories(uniqueCategories);
    }
  }, [flashcards]);

  // Spaced repetition algorithm
  const calculateNextReview = useCallback((card: Flashcard, performance: 'correct' | 'incorrect') => {
    let easeFactor = card.easeFactor;
    let interval = 1; // days
    
    if (performance === 'correct') {
      if (card.timesReviewed === 0) {
        interval = 1;
      } else if (card.timesReviewed === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      easeFactor = Math.max(1.3, easeFactor + 0.1);
    } else {
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    return { easeFactor, nextReview };
  }, []);

  const createFlashcard = useCallback(() => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    
    const card: Flashcard = {
      id: Date.now().toString(),
      front: newCard.front.trim(),
      back: newCard.back.trim(),
      category: newCard.category.trim() || 'General',
      difficulty: newCard.difficulty,
      created: new Date(),
      timesReviewed: 0,
      correctCount: 0,
      incorrectCount: 0,
      easeFactor: 2.5,
      nextReview: new Date()
    };
    
    setFlashcards(prev => [...prev, card]);
    setNewCard({ front: '', back: '', category: '', difficulty: 'medium' });
    setIsCreateDialogOpen(false);
  }, [newCard]);

  const updateFlashcard = useCallback((id: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
  }, []);

  const deleteFlashcard = useCallback((id: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== id));
    if (currentCard?.id === id) {
      setCurrentCard(null);
      setShowAnswer(false);
    }
  }, [currentCard]);

  const startStudySession = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter cards that need review
    let cardsToStudy = flashcards.filter(card => {
      if (selectedCategory !== 'all' && card.category !== selectedCategory) {
        return false;
      }
      return card.nextReview <= new Date();
    });
    
    // If no cards need review, include all cards from selected category
    if (cardsToStudy.length === 0) {
      cardsToStudy = flashcards.filter(card => 
        selectedCategory === 'all' || card.category === selectedCategory
      );
    }
    
    // Shuffle the deck
    const shuffled = [...cardsToStudy].sort(() => Math.random() - 0.5);
    
    setStudyQueue(shuffled);
    setCurrentCard(shuffled[0] || null);
    setStudyMode(true);
    setShowAnswer(false);
    setSessionStats({
      id: Date.now().toString(),
      startTime: new Date(),
      cardsStudied: 0,
      correctAnswers: 0,
      totalTime: 0
    });
  }, [flashcards, selectedCategory]);

  const handleCardResponse = useCallback((response: 'correct' | 'incorrect') => {
    if (!currentCard || !sessionStats) return;
    
    const { easeFactor, nextReview } = calculateNextReview(currentCard, response);
    
    const updatedCard: Flashcard = {
      ...currentCard,
      lastReviewed: new Date(),
      timesReviewed: currentCard.timesReviewed + 1,
      correctCount: response === 'correct' ? currentCard.correctCount + 1 : currentCard.correctCount,
      incorrectCount: response === 'incorrect' ? currentCard.incorrectCount + 1 : currentCard.incorrectCount,
      easeFactor,
      nextReview
    };
    
    updateFlashcard(currentCard.id, updatedCard);
    
    // Update session stats
    const newSessionStats = {
      ...sessionStats,
      cardsStudied: sessionStats.cardsStudied + 1,
      correctAnswers: response === 'correct' ? sessionStats.correctAnswers + 1 : sessionStats.correctAnswers
    };
    setSessionStats(newSessionStats);
    
    // Move to next card
    const currentIndex = studyQueue.findIndex(card => card.id === currentCard.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < studyQueue.length) {
      setCurrentCard(studyQueue[nextIndex]);
      setShowAnswer(false);
    } else {
      // End session
      const endTime = new Date();
      const totalTime = Math.round((endTime.getTime() - sessionStats.startTime.getTime()) / 1000);
      setSessionStats({ ...newSessionStats, endTime, totalTime });
      setStudyMode(false);
      setCurrentCard(null);
    }
  }, [currentCard, sessionStats, studyQueue, calculateNextReview, updateFlashcard]);

  const endStudySession = useCallback(() => {
    if (sessionStats) {
      const endTime = new Date();
      const totalTime = Math.round((endTime.getTime() - sessionStats.startTime.getTime()) / 1000);
      setSessionStats({ ...sessionStats, endTime, totalTime });
    }
    setStudyMode(false);
    setCurrentCard(null);
    setShowAnswer(false);
  }, [sessionStats]);

  const getStudyStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueToday = flashcards.filter(card => card.nextReview <= new Date()).length;
    const studiedToday = flashcards.filter(card => {
      if (!card.lastReviewed) return false;
      const reviewDate = new Date(card.lastReviewed);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate.getTime() === today.getTime();
    }).length;
    
    const totalReviews = flashcards.reduce((sum, card) => sum + card.timesReviewed, 0);
    const totalCorrect = flashcards.reduce((sum, card) => sum + card.correctCount, 0);
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
    
    return { dueToday, studiedToday, totalReviews, accuracy };
  }, [flashcards]);

  const stats = getStudyStats();
  const filteredCards = selectedCategory === 'all' ? 
    flashcards : 
    flashcards.filter(card => card.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Flashcard System</h2>
          <p className="text-muted-foreground">Smart spaced repetition learning</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Flashcard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Front (Question)</Label>
                  <Textarea
                    id="front"
                    placeholder="Enter the question or prompt..."
                    value={newCard.front}
                    onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="back">Back (Answer)</Label>
                  <Textarea
                    id="back"
                    placeholder="Enter the answer or explanation..."
                    value={newCard.back}
                    onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Math, History..."
                      value={newCard.category}
                      onChange={(e) => setNewCard(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newCard.difficulty}
                      onChange={(e) => setNewCard(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createFlashcard}>
                    Create Card
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
            <div className="text-sm text-muted-foreground">Due Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.studiedToday}</div>
            <div className="text-sm text-muted-foreground">Studied Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{flashcards.length}</div>
            <div className="text-sm text-muted-foreground">Total Cards</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="study" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="cards">Manage Cards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="study" className="space-y-4">
          {!studyMode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Category:</Label>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <Button onClick={startStudySession} className="gap-2 ml-auto">
                  <Brain className="h-4 w-4" />
                  Start Study Session
                </Button>
              </div>
              
              {sessionStats?.endTime && (
                <Card className="bg-green-50 dark:bg-green-950">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Session Complete! 🎉
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Cards Studied</div>
                        <div className="text-green-600">{sessionStats.cardsStudied}</div>
                      </div>
                      <div>
                        <div className="font-medium">Correct Answers</div>
                        <div className="text-green-600">
                          {sessionStats.correctAnswers}/{sessionStats.cardsStudied}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Time Spent</div>
                        <div className="text-green-600">
                          {Math.floor(sessionStats.totalTime / 60)}:{(sessionStats.totalTime % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Study Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>
                    {sessionStats?.cardsStudied || 0} / {studyQueue.length}
                  </span>
                </div>
                <Progress 
                  value={studyQueue.length > 0 ? ((sessionStats?.cardsStudied || 0) / studyQueue.length) * 100 : 0}
                />
              </div>
              
              {/* Flashcard */}
              {currentCard && (
                <Card className="min-h-[300px]">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {currentCard.category}
                      </CardTitle>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {currentCard.difficulty}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAnswer(!showAnswer)}
                          className="gap-1"
                        >
                          {showAnswer ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showAnswer ? 'Hide' : 'Show'} Answer
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-medium mb-4">
                        {currentCard.front}
                      </div>
                      
                      {showAnswer && (
                        <div className="border-t pt-4">
                          <div className="text-base text-muted-foreground">
                            {currentCard.back}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {showAnswer && (
                      <div className="flex justify-center gap-4 pt-4">
                        <Button
                          onClick={() => handleCardResponse('incorrect')}
                          variant="outline"
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Incorrect
                        </Button>
                        <Button
                          onClick={() => handleCardResponse('correct')}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Correct
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={endStudySession}>
                  End Session
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-4">
          <div className="flex justify-between items-center">
            <select
              className="px-3 py-2 border rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories ({flashcards.length})</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} ({flashcards.filter(c => c.category === category).length})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid gap-4">
            {filteredCards.map(card => (
              <Card key={card.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="font-medium">{card.front}</div>
                      <div className="text-sm text-muted-foreground">{card.back}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Category: {card.category}</span>
                        <span>Difficulty: {card.difficulty}</span>
                        <span>Reviews: {card.timesReviewed}</span>
                        <span>Accuracy: {card.timesReviewed > 0 ? Math.round((card.correctCount / card.timesReviewed) * 100) : 0}%</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCard(card)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFlashcard(card.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Overall Accuracy</span>
                    <span className="font-bold">{stats.accuracy}%</span>
                  </div>
                  <Progress value={stats.accuracy} />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {flashcards.reduce((sum, card) => sum + card.correctCount, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Correct Answers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {flashcards.reduce((sum, card) => sum + card.incorrectCount, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Incorrect Answers</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryCards = flashcards.filter(card => card.category === category);
                    const totalReviews = categoryCards.reduce((sum, card) => sum + card.timesReviewed, 0);
                    const correctAnswers = categoryCards.reduce((sum, card) => sum + card.correctCount, 0);
                    const accuracy = totalReviews > 0 ? Math.round((correctAnswers / totalReviews) * 100) : 0;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <span>{category} ({categoryCards.length} cards)</span>
                          <span className="font-medium">{accuracy}%</span>
                        </div>
                        <Progress value={accuracy} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}