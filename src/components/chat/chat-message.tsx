import { UIMessage } from "ai";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

type Props = {
  message: UIMessage;
};

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <Bubble
      variant={isUser ? "default" : "ghost"}
      align={isUser ? "end" : "start"}
      className={cn(!isUser && "w-full")}
    >
      <BubbleContent
        className={cn(
          !isUser && "px-0 py-0",
          isUser && "bg-blue-500! text-white!",
        )}
      >
        {message.parts.map((part, i) => {
          // Обычный текст
          if (part.type === "text") {
            return (
              <span key={i} className="whitespace-pre-wrap">
                {part.text}
              </span>
            );
          }

          // Tool call: AI обновил заметку
          if (part.type === "tool-updateNote") {
            if (part.state === "output-available") {
              const output = part.output as
                | { success: boolean; noteId?: string; error?: string }
                | undefined;

              if (output?.success) {
                return (
                  <div
                    key={i}
                    className="my-2 flex items-center gap-2 rounded-md border bg-accent/50 px-3 py-2 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">
                      AI обновил заметку
                    </span>
                    {output.noteId && (
                      <Link
                        href={`/notes/${output.noteId}`}
                        target="_blank"
                        className="ml-auto font-medium text-foreground underline-offset-2 hover:underline"
                      >
                        Открыть
                      </Link>
                    )}
                  </div>
                );
              }

              if (output?.error) {
                return (
                  <div
                    key={i}
                    className="my-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  >
                    Не удалось обновить: {output.error}
                  </div>
                );
              }
            }

            // Tool ещё выполняется
            return (
              <div
                key={i}
                className="my-2 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>AI обновляет заметку...</span>
              </div>
            );
          }

          return null;
        })}
      </BubbleContent>
    </Bubble>
  );
}
