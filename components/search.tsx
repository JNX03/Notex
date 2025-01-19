"use client"

import { Input } from "@/components/ui/input"
import { Search as SearchIcon } from "lucide-react"

interface SearchProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Search({ value, onChange }: SearchProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search notes..."
        className="pl-8"
        value={value}
        onChange={onChange}
      />
    </div>
  )
} 