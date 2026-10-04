import { z } from "zod";

/**
 * Схемы валидации входных данных API.
 * Привязка к userId происходит на сервере, клиент её не передаёт —
 * поэтому в схемах только поля от клиента.
 */

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().max(20_000).optional(),
});

export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().max(20_000).optional(),
    status: z.enum(["not-started", "in-progress", "done"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Нет данных для обновления",
  });

export const createChatSchema = z.object({
  noteId: z.string().trim().max(100).optional(),
  title: z.string().trim().max(200).optional(),
});

export const createMessageSchema = z.object({
  chatId: z.string().trim().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(20_000),
});

export const chatRequestSchema = z.object({
  // Сообщения приходят из useChat в формате UIMessage (AI SDK v7, поле parts).
  // Сами сообщения не пересоздаём — оставляем как есть, валидируем лишь массив.
  messages: z.array(z.unknown()).min(1),
  noteId: z.string().trim().max(100).nullable().optional(),
  chatId: z.string().trim().max(100).nullable().optional(),
});
