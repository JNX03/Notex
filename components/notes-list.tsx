"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { QuestionsDialog } from "./questions-dialog";
import { Search } from "@/components/ui/search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Clock, BookOpen, X } from "lucide-react";
import { getFavorites, toggleFavorite, getLastViewed, updateLastViewed, updateStreak } from "@/lib/favorites";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@/components/pdf-viewer";
import { updateStats, initializeStats } from "@/lib/stats";
// import { Countdown } from "./Countdown";

// { title: "Chemical ม.4 กลางภาคเทอม 2", href: "file/Chemical3.pdf", keywords: ["เคมี ม.4", "บทที่ 3"], description: "TBA", status: "TBA", release: "2024-12-28T23:59:59" },

export const notes = [
  {
    id: "1",
    title: "วิทยาศาสตร์ ม.3",
    description: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค",
    category: "Science",
    href: "file/ScienctM3Energy.pdf",
    isFavorite: true,
    lastViewed: "2 hours ago"
  },
  {
    id: "2",
    title: "วิทยาศาสตร์ ม.3 (คลื่นและแสง)",
    description: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 1",
    category: "Science",
    href: "file/ScienctM3WaveMagnetLight.pdf",
    lastViewed: "3 days ago"
  },
  {
    id: "3",
    title: "วิทยาศาสตร์ ม.3 (ระบบสุริยะ)",
    description: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 1",
    category: "Science",
    href: "file/ScienctM3Solar.pdf",
    lastViewed: "1 week ago"
  },
  {
    id: "4",
    title: "วิทยาศาสตร์ ม.3 (เคมี)",
    description: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 2",
    category: "Chemistry",
    href: "file/ScienctM3Chemical.pdf",
    lastViewed: "2 weeks ago"
  },
  {
    id: "5",
    title: "Chemical ม.4 [1]",
    description: "Chemical - Jnx03 [1]",
    category: "Chemistry",
    href: "file/Chemical1.pdf",
    isFavorite: true,
    lastViewed: "1 day ago"
  },
  {
    id: "6",
    title: "Chemical ม.4 [2]",
    description: "Chemical - Jnx03 [2]",
    category: "Chemistry",
    href: "file/Chemical2.pdf",
    lastViewed: "4 days ago"
  },
  {
    id: "7",
    title: "ENG A [2]",
    description: "English Advanced Course Notes",
    category: "English",
    href: "file/English.pdf",
    lastViewed: "5 days ago"
  },
  {
    id: "8",
    title: "สุขศึกษา ม.4",
    description: "สุขศึกษา - Jnx03 [2]",
    category: "Health",
    href: "file/M4health_education.pdf",
    lastViewed: "1 week ago"
  }
];

interface QuestionData {
  noteTitle: string;
  questions: {
    question: string;
    options: string[];
    answer: string;
    type: 'multiple-choice' | 'true-false';
  }[];
}

interface NotesListProps {
  filterFavorites?: boolean;
  filterRecent?: boolean;
  limit?: number;
}

export function NotesList({ filterFavorites, filterRecent, limit }: NotesListProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastViewed, setLastViewed] = useState<Record<string, string>>({});
  const [favoriteNotes, setFavoriteNotes] = useState<{ href: string; title: string; keywords: string[]; description: string }[]>([]);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionData["questions"]>([]);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [selectedNoteTitle, setSelectedNoteTitle] = useState("");
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    // Load favorites
    getFavorites().then(setFavorites);
    // Load last viewed
    getLastViewed().then(setLastViewed);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFavorites = localStorage.getItem("favoriteNotes");
      setFavoriteNotes(storedFavorites ? JSON.parse(storedFavorites) : []);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteNotes", JSON.stringify(favoriteNotes));
    }
  }, [favoriteNotes]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/questions.json');
        const data = await response.json();
        console.log('Loaded questions:', data);
        setQuestionsData(data.questions);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    // Initialize stats with total number of notes
    initializeStats(notes.length);
  }, []);

  const handleNoteClick = async (noteId: string, title: string, href: string) => {
    const startTime = Date.now();
    window.open(href, '_blank');
    
    // Update streak but don't store in state since we don't display it
    updateStreak();
    
    await updateLastViewed(noteId);
    const updated = await getLastViewed();
    setLastViewed(updated);

    setTimeout(() => {
      const duration = (Date.now() - startTime) / 1000;
      if (duration >= 30) {
        updateStats(title, duration);
      }
    }, 30000);
  };

  const handleFavoriteClick = async (noteId: string) => {
    const newFavorites = await toggleFavorite(noteId);
    setFavorites(newFavorites);
  };

  const handleQuizClick = (noteTitle: string) => {
    console.log('Quiz clicked for:', noteTitle);
    console.log('Available questions:', questionsData);
    const questionSet = questionsData.find(q => q.noteTitle === noteTitle);
    console.log('Found question set:', questionSet);
    if (questionSet?.questions) {
      setSelectedQuestions(questionSet.questions);
      setSelectedNoteTitle(noteTitle);
      setIsQuestionsOpen(true);
    }
  };

  const handlePdfClose = (title: string) => {
    if (startTime.current) {
      const duration = (Date.now() - startTime.current) / 1000; // Convert to seconds
      updateStats(title, duration);
      startTime.current = null;
    }
    setSelectedPdf(null);
  };

  const filteredNotes = notes.filter(note => {
    // Search filter
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    
    // Favorites filter
    const matchesFavorites = !filterFavorites || favorites.includes(note.id);
    
    // Recent filter (last 7 days)
    const matchesRecent = !filterRecent || (
      lastViewed[note.id] && 
      (new Date().getTime() - new Date(lastViewed[note.id]).getTime()) / (1000 * 60 * 60 * 24) <= 7
    );

    return matchesSearch && matchesCategory && matchesFavorites && matchesRecent;
  }).slice(0, limit);

  const categories = Array.from(new Set(notes.map(note => note.category)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Search value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium line-clamp-1">
                  {note.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteClick(note.id);
                  }}
                >
                  <Star className={cn(
                    "h-4 w-4",
                    favorites.includes(note.id) 
                      ? "text-yellow-500 fill-yellow-500" 
                      : "text-muted-foreground"
                  )} />
                </Button>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2">
                  {note.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span className="line-clamp-1">{lastViewed[note.id] || "Not viewed yet"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs sm:text-sm"
                      onClick={() => handleQuizClick(note.title)}
                    >
                      Quiz
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs sm:text-sm"
                      onClick={() => handleNoteClick(note.id, note.title, note.href)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Open
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Inline PDF Viewer */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 bg-background rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">PDF Viewer</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handlePdfClose(
                  notes.find(n => n.href === selectedPdf)?.title || ""
                )}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100%-4rem)] p-4">
              <PDFViewer pdfUrl={selectedPdf} />
            </div>
          </div>
        </div>
      )}

      <QuestionsDialog
        isOpen={isQuestionsOpen}
        onClose={() => setIsQuestionsOpen(false)}
        questions={selectedQuestions}
        noteTitle={selectedNoteTitle}
      />
    </div>
  );
}
