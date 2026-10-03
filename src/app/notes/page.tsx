"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusSelect, NoteStatus } from "@/components/notes/status-select";
import { fetchNotes, createNote, updateNote } from "@/lib/api/notes";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push(`/notes/${newNote.id}`);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: NoteStatus }) =>
      updateNote(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground"> ...Loading </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No notes yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className={cn(
                "group flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
                "hover:bg-accent",
              )}
            >
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-medium">
                  {note.title || "Untitled"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* stopPropagation — чтобы клик на статусе не открывал заметку */}
              <div onClick={(e) => e.stopPropagation()}>
                <StatusSelect
                  value={note.status}
                  onChange={(status) =>
                    statusMutation.mutate({ id: note.id, status })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
