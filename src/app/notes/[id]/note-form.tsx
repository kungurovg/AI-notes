"use client";

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusSelect, NoteStatus } from "@/components/notes/status-select";
import { updateNote, deleteNote } from "@/lib/api/notes";
import { useDebounce } from "@/hooks/use-debounce";
import { Note } from "@/types";

type Props = {
  note: Note;
};

export function NoteForm({ note }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<Note>) => updateNote(note.id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(note.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes");
    },
  });

  useEffect(() => {
    if (debouncedTitle === note.title && debouncedContent === note.content)
      return;
    updateMutation.mutate({ title: debouncedTitle, content: debouncedContent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, debouncedContent]);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/notes")}
        className="mb-6 gap-2 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notes
      </Button>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        className="mb-2 border-none text-3xl font-bold shadow-none focus-visible:ring-0"
      />

      <div className="mb-6 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Created{" "}
          {new Date(note.createdAt).toLocaleDateString("En-en", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <StatusSelect
          value={note.status}
          onChange={(status: NoteStatus) => updateMutation.mutate({ status })}
        />
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start Typing..."
        className="min-h-96 resize-none border-none text-base shadow-none focus-visible:ring-0"
      />

      <div className="mt-6 flex justify-end">
        <Button
          variant="ghost"
          onClick={() => deleteMutation.mutate()}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete note
        </Button>
      </div>
    </div>
  );
}
