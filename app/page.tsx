"use client";

import React, { Suspense } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { NotesList } from "@/components/notes-list";
import { PDFViewer } from "@/components/pdf-viewer";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notex</h1>
          <p className="text-sm text-gray-500">
            by{" "}
            <a
              href="https://www.instagram.com/jxxn03z/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @Jxxn03z
            </a>
          </p>
        </div>
        <ModeToggle />
      </header>
      <div className="flex flex-col md:flex-row gap-8">
        <Suspense fallback={<div>Loading Notes...</div>}>
          <NotesList />
        </Suspense>
        <Suspense fallback={<div>Loading PDF Viewer...</div>}>
          <PDFViewer />
        </Suspense>
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        © 2024 NoteX - Developed with ❤️ by{" "}
        <a
          href="https://www.instagram.com/jxxn03z/"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @Jxxn03z
        </a>
      </footer>
    </div>
  );
}
