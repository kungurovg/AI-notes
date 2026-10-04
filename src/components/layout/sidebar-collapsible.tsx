"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { SidebarGroup } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Collapsible section for the sidebar (Notes / Chats).
 * Wraps a SidebarGroup so the label and body stay aligned with the rest.
 */
export function SidebarCollapsible({
  label,
  icon,
  defaultOpen = true,
  children,
  className,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <SidebarGroup className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
        />
        {icon}
        <span className="truncate">{label}</span>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </SidebarGroup>
  );
}
