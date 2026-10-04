"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createChat } from "@/lib/api/chats";

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");

  const createChatMutation = useMutation({
    mutationFn: () => createChat(),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.push(`/chat/${newChat.id}?prompt=${encodeURIComponent(input)}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    createChatMutation.mutate();
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-6 pb-32">
      <div className="mb-6 flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-accent">
        <Bot className="h-9 w-9 text-muted-foreground" />
      </div>
      <h1 className="mb-3 text-4xl font-bold">Where should we start first?</h1>
      <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
        Your AI-powered notes. Write, ask questions, and structure ideas
        together.
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="min-h-18 resize-none border pr-12 shadow-none focus-visible:ring-0"
            rows={1}
            disabled={createChatMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            disabled={!input.trim() || createChatMutation.isPending}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
