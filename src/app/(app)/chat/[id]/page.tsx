"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useAppStore } from "@/store/app-store";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatId = params.id as string;
  const prompt = searchParams.get("prompt");
  const selectChat = useAppStore((state) => state.selectChat);

  useEffect(() => {
    selectChat(chatId);
  }, [chatId, selectChat]);

  return <ChatPanel initialPrompt={prompt} />;
}
