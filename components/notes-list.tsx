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
      { title: "Chemical - Jnx03 [1]", href: "file/Chemical1.pdf", keywords: ["เคมี ม.4", "บทที่ 1"], description: "สรุป/Noteเคมีสำหรับ ม.4 บทที่ 1" },
      { title: "Chemical - Jnx03 [2]", href: "file/Chemical2.pdf", keywords: ["เคมี ม.4", "บทที่ 2"], description: "สรุป/Noteเคมีสำหรับ ม.4 บทที่ 2" },
    ],
  },
  {
    title: "Physics ม.4",
    items: [
      { title: "PhysicsM4 - Jnx03 [1]", href: "file/PhysicsM4-1.pdf", keywords: ["ฟิสิก", "ม.4"], description: "สรุป/Noteเคมีสำหรับ ม.4 บทที่ 1" },
    ],
  },
  {
    title: "อื่นๆ ม.4",
    items: [
      { title: "ENG A - Jnx03 [2]", href: "file/English.pdf", keywords: ["อังกฤษ", "ม.4"], description: "สรุป/Noteภาษาอังกฤษสำหรับ ม.4" },
      { title: "สุขศึกษา - Jnx03 [2]", href: "file/M4health_education.pdf", keywords: ["สุขศึกษา", "ม.4"], description: "สรุป/Noteสุขศึกษาสำหรับ ม.4" },
    ],
  },
];

export function NotesList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteNotes, setFavoriteNotes] = useState<{ href: string; title: string; keywords: string[]; description: string }[]>([]);

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

  const filteredNotes = notes.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  }));

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
                      <li key={itemIndex} className="flex items-center justify-between">
                        <div>
                          <button
                            onClick={() => handleClick(item.href)}
                            className="text-blue-500 hover:underline"
                          >
                            {item.title}
                          </button>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
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
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
