"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
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

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center p-6">
          <div className="h-full w-full max-w-2xl">
            <ChatPanel initialPrompt={prompt} />
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
