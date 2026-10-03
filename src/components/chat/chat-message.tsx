import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import { Bubble, BubbleContent } from "../ui/bubble";

type Props = {
  message: UIMessage;
};

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");

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
        {text}
      </BubbleContent>
    </Bubble>
  );
}
