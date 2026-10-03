import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const updated = await db
    .update(notes)
    .set({
      ...body,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(notes.id, id))
    .returning();

  if (updated.length === 0) {
    return Response.json({ error: "Note nof found" }, { status: 404 });
  }

  return Response.json(updated[0]);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const deleted = await db.delete(notes).where(eq(notes.id, id)).returning();

  if (deleted.length === 0) {
    return Response.json({ error: "Note not found " }, { status: 404 });
  }

  return Response.json({ success: true });
}
