import { headers } from "next/headers";
import { auth } from "./auth";

export function fail(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export async function requireUser(): Promise<string | Response> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return fail("Не авторизован", 401);
  }

  return session.user.id;
}
