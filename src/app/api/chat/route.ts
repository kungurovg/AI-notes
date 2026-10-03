import { streamText, convertToModelMessages } from "ai";
import { groq } from "@ai-sdk/groq";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes, messages as messagesTable } from "@/lib/db/schema";

export async function POST(request: Request) {
  const { messages, noteId, chatId } = await request.json();

  let noteContext = "";
  if (noteId) {
    const [note] = await db.select().from(notes).where(eq(notes.id, noteId));
    if (note) {
      noteContext = `Текущая заметка:\nЗаголовок: ${note.title}\nСодержание: ${note.content}`;
    }
  }

  const result = streamText({
    model: groq("openai/gpt-oss-20b"),
    system: `Ты полезный AI-ассистент для работы с заметками. Отвечай кратко и по делу. ${noteContext}`,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (chatId) {
        await db.insert(messagesTable).values({
          id: crypto.randomUUID(),
          chatId,
          role: "assistant",
          content: text,
          createdAt: new Date().toISOString(),
        });
      }
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  });
}
