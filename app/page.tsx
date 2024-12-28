"use client";

import React from "react";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col justify-between">
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
      
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Website is under maintenance.</h2>
          <p className="text-xl">Update in process</p>
        </div>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>
          © 2024 NoteX - Developed with ❤️ by{" "}
          <a
            href="https://www.instagram.com/jxxn03z/"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @Jxxn03z
          </a>
        </p>
      </footer>
    </div>
  );
}

