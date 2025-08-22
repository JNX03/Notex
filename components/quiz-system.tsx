'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy,
  Brain,
  BookOpen,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  created: Date;
  attempts: QuizAttempt[];
}

interface QuizAttempt {
  id: string;
  startTime: Date;
  endTime?: Date;
  answers: Record<string, string>;
  score: number;
  timeSpent: number; // in seconds
  passed: boolean;
}

interface QuizSession {
  quiz: Quiz;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startTime: Date;
  timeRemaining?: number;
}

export function QuizSystem() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: '',
    timeLimit: '',
    passingScore: '70'
  });
  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    category: '',
    difficulty: 'medium',
    points: 1
  });
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);

  // Load quizzes on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quizzes');
      if (saved) {
        const parsed = JSON.parse(saved).map((quiz: any) => ({
          ...quiz,
          created: new Date(quiz.created),
          attempts: quiz.attempts.map((attempt: any) => ({
            ...attempt,
            startTime: new Date(attempt.startTime),
            endTime: attempt.endTime ? new Date(attempt.endTime) : undefined
          }))
        }));
        setQuizzes(parsed);
      } else {
        // Create demo quiz if none exists
        const demoQuiz: Quiz = {
          id: 'demo-1',
          title: 'General Knowledge Demo',
          description: 'A sample quiz to test the system functionality',
          category: 'General',
          timeLimit: 10, // 10 minutes
          passingScore: 70,
          created: new Date(),
          attempts: [],
          questions: [
            {
              id: 'q1',
              question: 'What is the capital of France?',
              type: 'multiple-choice',
              options: ['London', 'Berlin', 'Paris', 'Madrid'],
              correctAnswer: 'Paris',
              explanation: 'Paris is the capital and most populous city of France.',
              category: 'Geography',
              difficulty: 'easy',
              points: 1
            },
            {
              id: 'q2',
              question: 'Is the Earth flat?',
              type: 'true-false',
              correctAnswer: 'false',
              explanation: 'The Earth is a sphere (technically an oblate spheroid).',
              category: 'Science',
              difficulty: 'easy',
              points: 1
            },
            {
              id: 'q3',
              question: 'What is 2 + 2?',
              type: 'short-answer',
              correctAnswer: '4',
              explanation: 'Basic addition: 2 + 2 equals 4.',
              category: 'Math',
              difficulty: 'easy',
              points: 1
            }
          ]
        };
        setQuizzes([demoQuiz]);
      }
    }
  }, []);

  // Save quizzes when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && quizzes.length > 0) {
      localStorage.setItem('quizzes', JSON.stringify(quizzes));
    }
  }, [quizzes]);

  // Timer effect for quiz sessions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentSession && currentSession.quiz.timeLimit && currentSession.timeRemaining !== undefined && currentSession.timeRemaining > 0) {
      interval = setInterval(() => {
        setCurrentSession(prev => {
          if (!prev || prev.timeRemaining === undefined) return prev;
          
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            // Auto-submit quiz when time runs out
            setTimeout(() => {
              submitQuiz();
            }, 100);
            return { ...prev, timeRemaining: 0 };
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession?.timeRemaining]);

  const createQuiz = useCallback(() => {
    if (!newQuiz.title.trim() || currentQuestions.length === 0) return;
    
    const quiz: Quiz = {
      id: Date.now().toString(),
      title: newQuiz.title.trim(),
      description: newQuiz.description.trim(),
      category: newQuiz.category.trim() || 'General',
      questions: currentQuestions,
      timeLimit: newQuiz.timeLimit ? parseInt(newQuiz.timeLimit) : undefined,
      passingScore: parseInt(newQuiz.passingScore),
      created: new Date(),
      attempts: []
    };
    
    setQuizzes(prev => [...prev, quiz]);
    setNewQuiz({ title: '', description: '', category: '', timeLimit: '', passingScore: '70' });
    setCurrentQuestions([]);
    setIsCreateDialogOpen(false);
  }, [newQuiz, currentQuestions]);

  const addQuestion = useCallback(() => {
    if (!newQuestion.question?.trim()) return;
    
    const question: QuizQuestion = {
      id: Date.now().toString(),
      question: newQuestion.question.trim(),
      type: newQuestion.type || 'multiple-choice',
      options: newQuestion.type === 'multiple-choice' ? 
        newQuestion.options?.filter(opt => opt.trim()) : undefined,
      correctAnswer: newQuestion.correctAnswer || '',
      explanation: newQuestion.explanation?.trim(),
      category: newQuestion.category?.trim() || 'General',
      difficulty: newQuestion.difficulty || 'medium',
      points: newQuestion.points || 1
    };
    
    setCurrentQuestions(prev => [...prev, question]);
    setNewQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      category: '',
      difficulty: 'medium',
      points: 1
    });
  }, [newQuestion]);

  const startQuiz = useCallback((quiz: Quiz) => {
    const session: QuizSession = {
      quiz,
      currentQuestionIndex: 0,
      answers: {},
      startTime: new Date(),
      timeRemaining: quiz.timeLimit ? quiz.timeLimit * 60 : undefined
    };
    
    setCurrentSession(session);
    setShowResults(false);
    setSelectedQuiz(null);
  }, []);

  const answerQuestion = useCallback((questionId: string, answer: string) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: { ...prev.answers, [questionId]: answer }
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      const nextIndex = prev.currentQuestionIndex + 1;
      
      if (nextIndex >= prev.quiz.questions.length) {
        // Quiz is complete
        submitQuiz();
        return prev;
      }
      
      return { ...prev, currentQuestionIndex: nextIndex };
    });
  }, []);

  const previousQuestion = useCallback(() => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
      };
    });
  }, []);

  const submitQuiz = useCallback(() => {
    if (!currentSession) return;
    
    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
    
    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    
    currentSession.quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = currentSession.answers[question.id];
      
      if (question.type === 'short-answer') {
        // Simple string comparison for short answers (case-insensitive)
        if (userAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          correctAnswers += question.points;
        }
      } else {
        if (userAnswer === question.correctAnswer) {
          correctAnswers += question.points;
        }
      }
    });
    
    const score = totalPoints > 0 ? Math.round((correctAnswers / totalPoints) * 100) : 0;
    const passed = score >= currentSession.quiz.passingScore;
    
    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      startTime: currentSession.startTime,
      endTime,
      answers: currentSession.answers,
      score,
      timeSpent,
      passed
    };
    
    // Update quiz with new attempt
    setQuizzes(prev => prev.map(quiz => 
      quiz.id === currentSession.quiz.id 
        ? { ...quiz, attempts: [...quiz.attempts, attempt] }
        : quiz
    ));
    
    setLastAttempt(attempt);
    setShowResults(true);
    setCurrentSession(null);
  }, [currentSession]);

  const getQuizStats = useCallback(() => {
    const totalQuizzes = quizzes.length;
    const totalAttempts = quizzes.reduce((sum, quiz) => sum + quiz.attempts.length, 0);
    const passedAttempts = quizzes.reduce((sum, quiz) => 
      sum + quiz.attempts.filter(attempt => attempt.passed).length, 0
    );
    const averageScore = totalAttempts > 0 ? 
      Math.round(quizzes.reduce((sum, quiz) => 
        sum + quiz.attempts.reduce((attemptSum, attempt) => attemptSum + attempt.score, 0)
      , 0) / totalAttempts) : 0;
    
    return { totalQuizzes, totalAttempts, passedAttempts, averageScore };
  }, [quizzes]);

  const stats = getQuizStats();
  const currentQuestion = currentSession ? 
    currentSession.quiz.questions[currentSession.currentQuestionIndex] : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quiz System</h2>
          <p className="text-muted-foreground">Test your knowledge and track progress</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Quiz Details</TabsTrigger>
                <TabsTrigger value="questions">Questions ({currentQuestions.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter quiz title..."
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter quiz description..."
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Math"
                      value={newQuiz.category}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (min)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      placeholder="Optional"
                      value={newQuiz.timeLimit}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={newQuiz.passingScore}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, passingScore: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="questions" className="space-y-4">
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="font-semibold">Add Question</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      placeholder="Enter your question..."
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        className="w-full px-3 py-2 border rounded-md"
                        value={newQuestion.type}
                        onChange={(e) => setNewQuestion(prev => ({ 
                          ...prev, 
                          type: e.target.value as any,
                          options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : undefined
                        }))}
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="short-answer">Short Answer</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <select
                        id="difficulty"
                        className="w-full px-3 py-2 border rounded-md"
                        value={newQuestion.difficulty}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        min="1"
                        value={newQuestion.points}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                  </div>
                  
                  {newQuestion.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {newQuestion.options?.map((option, index) => (
                        <Input
                          key={index}
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(newQuestion.options || [])];
                            newOptions[index] = e.target.value;
                            setNewQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {newQuestion.type === 'true-false' && (
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <RadioGroup
                        value={newQuestion.correctAnswer}
                        onValueChange={(value) => setNewQuestion(prev => ({ ...prev, correctAnswer: value }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="true" />
                          <Label htmlFor="true">True</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="false" />
                          <Label htmlFor="false">False</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  
                  {(newQuestion.type === 'multiple-choice' || newQuestion.type === 'short-answer') && (
                    <div className="space-y-2">
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      {newQuestion.type === 'multiple-choice' ? (
                        <select
                          id="correctAnswer"
                          className="w-full px-3 py-2 border rounded-md"
                          value={newQuestion.correctAnswer}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                        >
                          <option value="">Select correct answer...</option>
                          {newQuestion.options?.map((option, index) => (
                            option.trim() && (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            )
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="correctAnswer"
                          placeholder="Enter correct answer..."
                          value={newQuestion.correctAnswer}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="explanation">Explanation (Optional)</Label>
                    <Textarea
                      id="explanation"
                      placeholder="Explain the correct answer..."
                      value={newQuestion.explanation}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                    />
                  </div>
                  
                  <Button onClick={addQuestion} className="w-full">
                    Add Question
                  </Button>
                </div>
                
                {/* Questions List */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Questions ({currentQuestions.length})</h3>
                  {currentQuestions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{question.question}</div>
                            <div className="text-sm text-muted-foreground">
                              {question.type} • {question.difficulty} • {question.points} pts
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentQuestions(prev => prev.filter(q => q.id !== question.id))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createQuiz} disabled={!newQuiz.title.trim() || currentQuestions.length === 0}>
                    Create Quiz
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQuizzes}</div>
            <div className="text-sm text-muted-foreground">Total Quizzes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalAttempts}</div>
            <div className="text-sm text-muted-foreground">Attempts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.passedAttempts}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.averageScore}%</div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Session */}
      {currentSession && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentSession.quiz.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {currentSession.timeRemaining !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(currentSession.timeRemaining)}
                  </div>
                )}
                <div>
                  Question {currentSession.currentQuestionIndex + 1} of {currentSession.quiz.questions.length}
                </div>
              </div>
            </div>
            <Progress 
              value={((currentSession.currentQuestionIndex + 1) / currentSession.quiz.questions.length) * 100} 
            />
          </CardHeader>
          
          {currentQuestion && (
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
                
                {currentQuestion.type === 'multiple-choice' && (
                  <RadioGroup
                    value={currentSession.answers[currentQuestion.id] || ''}
                    onValueChange={(value) => answerQuestion(currentQuestion.id, value)}
                  >
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentQuestion.type === 'true-false' && (
                  <RadioGroup
                    value={currentSession.answers[currentQuestion.id] || ''}
                    onValueChange={(value) => answerQuestion(currentQuestion.id, value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false">False</Label>
                    </div>
                  </RadioGroup>
                )}
                
                {currentQuestion.type === 'short-answer' && (
                  <Textarea
                    placeholder="Enter your answer..."
                    value={currentSession.answers[currentQuestion.id] || ''}
                    onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                  />
                )}
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentSession.currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={submitQuiz}>
                    Submit Quiz
                  </Button>
                  
                  {currentSession.currentQuestionIndex < currentSession.quiz.questions.length - 1 ? (
                    <Button onClick={nextQuestion}>
                      Next
                    </Button>
                  ) : (
                    <Button onClick={submitQuiz}>
                      Finish
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Results */}
      {showResults && lastAttempt && (
        <Card className={`${lastAttempt.passed ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastAttempt.passed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Congratulations! You Passed!
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Try Again
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{lastAttempt.score}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatTime(lastAttempt.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {lastAttempt.passed ? 'Passed' : 'Failed'}
                </div>
                <div className="text-sm text-muted-foreground">Result</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Quizzes */}
      {!currentSession && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Quizzes</h3>
          <div className="grid gap-4">
            {quizzes.map(quiz => (
              <Card key={quiz.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{quiz.title}</h4>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {quiz.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{quiz.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{quiz.questions.length} questions</span>
                        {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
                        <span>{quiz.passingScore}% to pass</span>
                        <span>{quiz.attempts.length} attempts</span>
                        {quiz.attempts.length > 0 && (
                          <span>Best: {Math.max(...quiz.attempts.map(a => a.score))}%</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuiz(quiz)}
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => startQuiz(quiz)}
                        className="gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Start
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}