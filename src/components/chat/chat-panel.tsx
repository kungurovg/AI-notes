"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/app-store";
import { fetchMessages, saveMessage } from "@/lib/api/messages";
import { ChatMessage } from "./chat-message";

type Props = {
  initialPrompt?: string | null;
};

export function ChatPanel({ initialPrompt }: Props = {}) {
  const selectedNoteId = useAppStore((state) => state.selectedNoteId);
  const selectedChatId = useAppStore((state) => state.selectedChatId);
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
  const sentPromptRef = useRef(false);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { noteId: selectedNoteId, chatId: selectedChatId },
    }),
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const { data: savedMessages = [] } = useQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: () => fetchMessages(selectedChatId!),
    enabled: !!selectedChatId,
  });

  useEffect(() => {
    if (!initialPrompt || sentPromptRef.current || !selectedChatId) return;
    sentPromptRef.current = true;
    sendMessage({ text: initialPrompt });
  }, [initialPrompt, selectedChatId, sendMessage]);

  useEffect(() => {
    if (!selectedChatId || savedMessages.length === 0) return;
    setMessages(
      savedMessages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text" as const, text: m.content }],
      })),
    );
  }, [selectedChatId, savedMessages, setMessages]);

  const isActive = status === "streaming" || status === "submitted";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChatId) return;

    const text = input.trim();
    await saveMessage(selectedChatId, "user", text);
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full border rounded-2xl ">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Hey!</h3>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              What are we working on today? Press send to start a new
              conversation.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 py-4">
        <form className="mx-auto max-w-2xl" onSubmit={handleSubmit}>
          <div className="relative">
            <Textarea
              className="resize-none border shadow-none min-h-20 bg-transparent px-4 py-3 pr-12"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask question"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              disabled={!input.trim() || isActive || !selectedChatId}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
