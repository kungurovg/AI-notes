"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
      <SidebarTrigger />
      <span className="text-base font-semibold">AI-Notes</span>
    </header>
  );
}
