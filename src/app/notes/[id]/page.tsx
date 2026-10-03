"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchNotes } from "@/lib/api/notes";
import { NoteForm } from "./note-form";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  const note = notes.find((n) => n.id === noteId);

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading...</div>;
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Note not found</p>
        <Button variant="outline" onClick={() => router.push("/notes")}>
          Back to notes
        </Button>
      </div>
    );
  }

  return <NoteForm key={note.id} note={note} />;
}
