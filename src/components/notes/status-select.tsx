"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type NoteStatus = "not-started" | "in-progress" | "done";

const STATUS_OPTIONS: {
  value: NoteStatus;
  label: string;
  className: string;
}[] = [
  {
    value: "not-started",
    label: "Not started",
    className: "bg-muted text-muted-foreground",
  },
  {
    value: "in-progress",
    label: "In progress",
    className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  },
  {
    value: "done",
    label: "Done",
    className: "bg-green-500/20 text-green-600 dark:text-green-400",
  },
];

type Props = {
  value: NoteStatus;
  onChange: (value: NoteStatus) => void;
  className?: string;
};

export function StatusSelect({ value, onChange, className }: Props) {
  const current = STATUS_OPTIONS.find((s) => s.value === value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as NoteStatus)}>
      <SelectTrigger
        className={cn(
          "h-7 w-auto gap-1.5 rounded-full border-none px-2.5 text-xs font-medium",
          current?.className,
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  option.value === "not-started" && "bg-muted-foreground",
                  option.value === "in-progress" && "bg-yellow-500",
                  option.value === "done" && "bg-green-500",
                )}
              />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
