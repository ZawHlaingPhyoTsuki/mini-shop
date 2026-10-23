import request from "supertest";
import type { Response } from "supertest";
import type { App } from "supertest/types.js";

// The session cookie is Secure, which supertest agents withhold over
// plain HTTP. Attaching it as an explicit header exercises the same
// real session lookup without weakening cookie attributes.
export function authed(server: App, cookie: string) {
  const r = request(server);
  return {
    get: (url: string) => r.get(url).set("Cookie", cookie),
    post: (url: string) => r.post(url).set("Cookie", cookie),
    patch: (url: string) => r.patch(url).set("Cookie", cookie),
    delete: (url: string) => r.delete(url).set("Cookie", cookie),
  };
}

export function sessionCookie(res: Response) {
  const setCookie = res.headers["set-cookie"] as unknown as string[];
  return setCookie.map((c) => c.split(";")[0]).join("; ");
}

export async function signUp(server: App, name: string, email: string) {
  const res = await request(server)
    .post("/api/auth/sign-up/email")
    .send({ name, email, password: "TestPassword123!" })
    .expect(200);
  return (res.body as { user: { id: string } }).user.id;
}

export async function signIn(server: App, email: string) {
  const res = await request(server)
    .post("/api/auth/sign-in/email")
    .send({ email, password: "TestPassword123!" })
    .expect(200);
  return sessionCookie(res);
}
