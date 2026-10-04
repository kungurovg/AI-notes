"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { fetchNotes } from "@/lib/api/notes";
import { cn } from "@/lib/utils";

export function NotesList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectedNoteId = useAppStore((state) => state.selectedNoteId);
  const selectNote = useAppStore((state) => state.selectNote);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  if (isLoading) {
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">Loading...</p>
    );
  }

  const lowerQuery = searchQuery.trim().toLowerCase();
  const isSearching = lowerQuery.length > 0;

  const filtered = isSearching
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(lowerQuery) ||
          n.content.toLowerCase().includes(lowerQuery),
      )
    : notes;

  if (filtered.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-xs text-muted-foreground">
        {isSearching ? "Nothing found" : "No notes yet. Create one."}
      </p>
    );
  }

  const handleClick = (noteId: string) => {
    selectNote(noteId);
    router.push(`/notes/${noteId}`);
  };

  return (
    <div className="flex flex-col gap-0.5">
      {filtered.map((note) => {
        const active =
          pathname === `/notes/${note.id}` || selectedNoteId === note.id;

        return (
          <button
            key={note.id}
            onClick={() => handleClick(note.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
              "hover:bg-accent",
              active && "bg-accent",
            )}
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-sm">
              {note.title || "Untitled"}
            </span>
            {/* Точка статуса */}
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                note.status === "not-started" && "bg-muted-foreground/60",
                note.status === "in-progress" && "bg-yellow-500",
                note.status === "done" && "bg-green-500",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
