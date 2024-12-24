"use client";

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
      { title: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค (พลังงาน)", href: "file/ScienctM3Energy.pdf" },
      { title: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 1 (คลื่นและแสง)", href: "file/ScienctM3WaveMagnetLight.pdf" },
      { title: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 1 (ระบุสุริยะของเรา)", href: "file/ScienctM3Solar.pdf" },
      { title: "สรุปวิทย์ศาสรต์ ม.3 ปลายภาค เทอม 2 (เคมีพื้นฐาน)", href: "file/ScienctM3Chemical.pdf" },
    ],
  },
  {
    title: "Chemical ม.4",
    items: [
      { title: "Chemical - Jnx03 [1]", href: "file/Chemical1.pdf" },
      { title: "Chemical - Jnx03 [2]", href: "file/Chemical2.pdf" },
    ],
  },
  {
    title: "อื่นๆ ม.4",
    items: [
      { title: "ENG A - Jnx03 [2]", href: "file/English.pdf" },
      { title: "สุขศึกษา - Jnx03 [2]", href: "file/M4health_education.pdf" },
    ],
  },
];

export function NotesList() {
  const router = useRouter();

  const handleClick = (href: string) => {
    router.push(`/?summary=${encodeURIComponent(href)}`); 
  };

  return (
    <Card className="w-full md:w-1/3">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {notes.map((section, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <button
                        onClick={() => handleClick(item.href)}
                        className="text-blue-500 hover:underline"
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
