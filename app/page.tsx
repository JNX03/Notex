"use client";

import React, { Suspense, useState, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { NotesList } from "@/components/notes-list";
import { PDFViewer } from "@/components/pdf-viewer";
import { FaGithub } from "react-icons/fa";

type Contributor = {
  id: number;
  html_url: string;
  avatar_url: string;
  login: string;
};

export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [contributors, setContributors] = useState<Contributor[]>([]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString());
    };

    const fetchContributors = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/JNX03/Notex/contributors"
        );
        if (response.ok) {
          const data: Contributor[] = await response.json();
          setContributors(data);
        } else {
          console.error("Failed to fetch contributors");
        }
      } catch (error) {
        console.error("Error fetching contributors:", error);
      }
    };

    fetchContributors();
    const timerId = setInterval(updateClock, 1000);
    updateClock(); // Initialize immediately

    return () => clearInterval(timerId);
  }, []);

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
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-sm text-gray-500">
            <span>{currentTime}</span>
            <span>{currentDate}</span>
          </div>
          <ModeToggle />
        </div>
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
        <div className="flex justify-center items-center gap-4 mt-4">
          <a
            href="https://github.com/JNX03/Notex"
            className="text-gray-500 hover:text-black"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={20} />
          </a>
          <p>Special thanks to contributors:</p>
          <div className="flex gap-2">
            {contributors.map((contributor) => (
              <a
                key={contributor.id}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-6 h-6 rounded-full"
                />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
