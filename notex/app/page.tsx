"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { NotesList } from "@/components/notes-list"
import { PDFViewer } from "@/components/pdf-viewer"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">โน้ตสรุป @Jnx03</h1>
        <ModeToggle />
      </header>
      <div className="flex flex-col md:flex-row gap-8">
        <NotesList />
        <PDFViewer />
      </div>
    </div>
  )
}

