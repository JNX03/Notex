"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { QuestionsDialog } from "./questions-dialog";
// import { Countdown } from "./Countdown";

// { title: "Chemical ม.4 กลางภาคเทอม 2", href: "file/Chemical3.pdf", keywords: ["เคมี ม.4", "บทที่ 3"], description: "TBA", status: "TBA", release: "2024-12-28T23:59:59" },

const notes = [
  {
    title: "วิทยาศาสตร์ ม.3",
    items: [
      { title: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค (พลังงาน)", href: "file/ScienctM3Energy.pdf", keywords: ["พลังงาน", "วิทย์ ม.3"], description: "สรุปเนื้อหาเกี่ยวกับพลังงานในวิทยาศาสตร์ ม.3" },
      { title: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 1 (คลื่นและแสง)", href: "file/ScienctM3WaveMagnetLight.pdf", keywords: ["คลื่น", "แสง", "วิทย์ ม.3"], description: "สรุปเนื้อหาเกี่ยวกับคลื่นและแสงในวิทยาศาสตร์ ม.3" },
      { title: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 1 (ระบุสุริยะของเรา)", href: "file/ScienctM3Solar.pdf", keywords: ["สุริยะ", "วิทย์ ม.3"], description: "สรุปเนื้อหาเกี่ยวกับระบบสุริยะในวิทยาศาสตร์ ม.3" },
      { title: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 2 (เคมีพื้นฐาน)", href: "file/ScienctM3Chemical.pdf", keywords: ["เคมี", "พื้นฐาน", "วิทย์ ม.3"], description: "สรุปเนื้อหาเกี่ยวกับเคมีพื้นฐานในวิทยาศาสตร์ ม.3" },
    ],
  },
  {
    title: "Chemical ม.4",
    items: [
      { title: "Chemical ม.4 กลางภาคเทอม 1 (Electron , Transition)", href: "file/Chemical1.pdf", keywords: ["เคมี ม.4", "บทที่ 1" , "Atomic" , "Develope" , "Transition","oxidation","Radiation"], description: "สรุป/Noteเคมีสำหรับ ม.4 บทที่ 1" },
      { title: "Chemical ม.4 ปลายภาคเทอม 1 (Covalent , Ionic)", href: "file/Chemical2.pdf", keywords: ["เคมี ม.4", "บทที่ 2","Ionic","Covalent","Bond"], description: "สรุป/Noteเคมีสำหรับ ม.4 บทที่ 2" },
      { title: "Chemical ม.4 กลางภาคเทอม 2", href: "file/Chemical3.pdf", keywords: ["เคมี ม.4", "บทที่ 3","พลังงานพันธะ","รูปร่าง","Molecule","สภาพขั้ว","มวลอะตอม","มวลเฉลี่ย","Mole","VSERP"], description: "สรุป/Noteเคมีสำหรับ ม.4 เนื้อหา : พลังงานพันธะ , รูปร่าง Molecule , สภาพขั้ว , มวลอะตอม , มวลเฉลี่ย , Mole",},
    ],
  },
  {
    title: "Physics ม.4",
    items: [
      { title: "PhysicsM4 ม.4 ม.4 ปลายภาคเทอม 1 (Force , Friction )", href: "file/PhysicsM4-1.pdf", keywords: ["ฟิสิก", "ม.4","แรงเสียดทาน","แรงดึงดูดระหว่างมวล","สมดุล","การหมุน","Friction"], description: "สรุป/Noteเคมีสำหรับ ม.4 บทที่ 1" },
      // { title: "PhysicsM4 ม.4 ม.4 กลางภาคเทอม 2", href: "", keywords: [], description: "TBA", status: "TBA", release: "2025-01-04T12:00:00" },
    ],
  },
  {
    title: "อื่นๆ ม.4",
    items: [
      { title: "ENG A M4 (subject-verb agreement)", href: "file/English.pdf", keywords: ["อังกฤษ", "ม.4","subject","verb"], description: "สรุป/Noteภาษาอังกฤษสำหรับ ม.4" },
      { title: "English M4 กลางภาคเทอม 1 (Comparison , Question Tag, Basic Mechanic Writing ,Author purpose, Vocab)", href: "file/ENG-AC.pdf", keywords: ["Vocab","Author", "purpose","Question", "Tag","Comparison"], description: "สรุป English เนื้อหา Comparison , Question Tag, Basic Mechanic Writing ,Author purpose, Vocab"},
      { title: "สุขศึกษา M4 (ระบบกระดูก - ระบบย่อยอาหาร)", href: "file/M4health_education.pdf", keywords: ["สุขศึกษา", "ม.4","กระดูก","ย่อยอาหาร","bone"], description: "สรุป/Noteสุขศึกษาสำหรับ ม.4" },
    ],
  },
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

export function NotesList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteNotes, setFavoriteNotes] = useState<{ href: string; title: string; keywords: string[]; description: string }[]>([]);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionData["questions"]>([]);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [selectedNoteTitle, setSelectedNoteTitle] = useState("");

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

  const handleClick = (href: string) => {
    router.push(`/?summary=${encodeURIComponent(href)}`);
  };

  const toggleFavorite = (item: { href: string; title: string; keywords: string[]; description: string }) => {
    setFavoriteNotes((prevFavorites) => {
      if (prevFavorites.some((fav) => fav.href === item.href)) {
        return prevFavorites.filter((fav) => fav.href !== item.href);
      } else {
        return [...prevFavorites, item];
      }
    });
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

  const filteredNotes = notes.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  }));

  // const announcements = notes.flatMap((section) =>
  //   section.items.filter((item) => item.release)
  // );

  return (
    <Card className="w-full md:w-1/3">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* {announcements.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-2">
              {announcements.map((item, index) => (
                <li key={index} className="flex flex-col">
                  <div>
                    <button
                      onClick={() => handleClick(item.href)}
                      className="text-blue-500 hover:underline"
                    >
                      {item.title}
                    </button>
                  </div>
                  <div className="mt-2">
                    <Countdown targetDate={item.release || ""} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )} */}

        {favoriteNotes.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold">Favorites</h2>
            <ul className="space-y-2">
              {favoriteNotes.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleClick(item.href)}
                    className="text-blue-500 hover:underline"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          {filteredNotes.map((section, index) => (
            section.items.length > 0 && (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{section.title}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <div>
                            <button
                              onClick={() => handleClick(item.href)}
                              className="text-blue-500 hover:underline"
                            >
                              {item.title}
                            </button>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {questionsData.some(q => q.noteTitle === item.title) && (
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleQuizClick(item.title);
                                }}
                                size="sm"
                                variant="outline"
                              >
                                Quiz
                              </Button>
                            )}
                            <button
                              onClick={() => toggleFavorite(item)}
                              className={`ml-2 p-1 rounded ${
                                favoriteNotes.some((fav) => fav.href === item.href)
                                  ? "text-yellow-500"
                                  : "text-gray-400"
                              } hover:text-yellow-500`}
                            >
                              ★
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          ))}
        </Accordion>

        <QuestionsDialog
          isOpen={isQuestionsOpen}
          onClose={() => setIsQuestionsOpen(false)}
          questions={selectedQuestions}
          noteTitle={selectedNoteTitle}
        />
      </CardContent>
    </Card>
  );
}
