/* eslint-disable @typescript-eslint/no-unused-vars */

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

export async function encryptJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT(
    payload as {
      id: string;
      username: string;
      expiresAt: Date;
    }
  )
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("24hr")
    .sign(key);
}

export async function decryptJWT(
  token: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    const { payload }: { payload: SessionPayload } = await jwtVerify(
      token,
      key,
      {
        algorithms: ["HS256"],
      }
    );
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(
  id: string,
  username: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encryptJWT({ id, expiresAt, username });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decryptJWT(session);
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
