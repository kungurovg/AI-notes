import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { groq } from "@ai-sdk/groq";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes, chats, messages as messagesTable } from "@/lib/db/schema";
import { requireUser, fail } from "@/lib/session";
import { chatRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const body = chatRequestSchema.parse(await request.json());
  const { noteId, chatId } = body;
  // zod подтвердил, что это массив; внутри — сообщения в формате UIMessage от useChat
  const messages = body.messages as UIMessage[];

  let noteContext = "";
  if (noteId) {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
    if (note) {
      noteContext = `Текущая заметка:\nЗаголовок: ${note.title}\nСодержание: ${note.content}`;
    }
  }

  // Если передан chatId — убеждаемся, что чат принадлежит пользователю
  if (chatId) {
    const [chat] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));
    if (!chat) {
      return fail("Чат не найден", 404);
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
