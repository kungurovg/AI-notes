import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { requireUser, fail } from "@/lib/session";
import { updateNoteSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const { id } = await params;
  const body = updateNoteSchema.parse(await request.json());

  const updated = await db
    .update(notes)
    .set({
      ...body,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  if (updated.length === 0) {
    return fail("Заметка не найдена", 404);
  }

  return Response.json(updated[0]);
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const { id } = await params;

  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  if (deleted.length === 0) {
    return fail("Заметка не найдена", 404);
  }

  return Response.json({ success: true });
}
