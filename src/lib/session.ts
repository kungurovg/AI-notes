import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Результат ошибки API. Позволяет и внутри роута, и в хелпере
 * единообразно вернуть JSON с нужным HTTP-статусом.
 */
export function fail(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

/**
 * Получает id текущего авторизованного пользователя из better-auth сессии.
 *
 * Если пользователь не авторизован — сразу возвращает Response с 401.
 * Используется как "страж" в защищённых API-роутах.
 */
export async function requireUser(): Promise<string | Response> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return fail("Не авторизован", 401);
  }

  return session.user.id;
}
