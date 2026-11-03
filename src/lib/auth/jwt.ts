import { SignJWT, jwtVerify } from "jose";

export type UserRole = "USER" | "ADMIN";

const secretKey = process.env.JWT_SECRET || "classnia-production-grade-jwt-secret-key-32-chars-minimum";
const key = new TextEncoder().encode(secretKey);

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function signToken(payload: TokenPayload, expiresIn = "7d"): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}
