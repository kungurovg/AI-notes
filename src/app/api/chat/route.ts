import { streamText, convertToModelMessages, tool, type UIMessage } from "ai";
import { groq } from "@ai-sdk/groq";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { notes, chats, messages as messagesTable } from "@/lib/db/schema";
import { requireUser, fail } from "@/lib/session";
import { chatRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const body = chatRequestSchema.parse(await request.json());
  const { noteId, chatId } = body;
  const messages = body.messages as UIMessage[];

  let noteContext = "";
  let currentNote: { id: string; title: string; content: string } | null = null;

  // Загружаем текущую заметку — она нужна и для контекста, и для tool
  if (noteId) {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    if (note) {
      currentNote = { id: note.id, title: note.title, content: note.content };
      noteContext = `\n\nТекущая заметка:\nЗаголовок: ${note.title}\nСодержание:\n${note.content}`;
    }
  }

  // Проверяем, что чат принадлежит пользователю
  if (chatId) {
    const [chat] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

    if (!chat) return fail("Чат не найден", 404);
  }

  const result = streamText({
    model: groq("openai/gpt-oss-20b"),
    system: `Ты полезный AI-ассистент для работы с заметками. Отвечай кратко и по делу.

У тебя есть инструмент updateNote — он заменяет ВСЁ содержимое текущей заметки.

ВАЖНО:
- Если пользователь просит изменить, добавить, переписать, сократить заметку — ВСЕГДА вызывай updateNote.
- В параметр content передавай ПОЛНЫЙ новый текст заметки, включая уже существующие части, которые не меняются. Не передавай только diff или только добавленное.
- Не спрашивай разрешения — просто делай.
- Если заметки нет — скажи, что нужно открыть заметку.
${noteContext}`,
    messages: await convertToModelMessages(messages),
    tools: {
      updateNote: tool({
        description:
          "Обновляет содержимое текущей открытой заметки. Используй, когда пользователь просит что-то изменить, добавить, удалить, переписать или сократить в заметке. Возвращай полный новый текст заметки.",
        inputSchema: z.object({
          // ← было parameters
          content: z
            .string()
            .min(1)
            .describe(
              "Полный новый текст заметки. Должен включать весь контент, который остаётся, и изменения.",
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Новый заголовок заметки, если пользователь просит его изменить",
            ),
        }),
        execute: async ({
          content,
          title,
        }: {
          content: string;
          title?: string;
        }) => {
          if (!currentNote) {
            return {
              success: false,
              error:
                "Нет открытой заметки. Попроси пользователя открыть заметку.",
            };
          }

          await db
            .update(notes)
            .set({
              content,
              ...(title ? { title } : {}),
              updatedAt: new Date().toISOString(),
            })
            .where(and(eq(notes.id, currentNote.id), eq(notes.userId, userId)));

          return {
            success: true,
            noteId: currentNote.id,
            message: "Заметка успешно обновлена",
          };
        },
      }),
    },
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
