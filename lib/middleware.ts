import { NextRequest } from "next/server";
import { extractToken, verifyToken, JWTPayload } from "./auth";

export async function authenticateRequest(
  req: NextRequest
): Promise<JWTPayload | null> {
  const authHeader = req.headers.get("Authorization");
  const token = extractToken(authHeader || "");

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}

export function requireAuth(
  requiredRoles?: string[]
): (payload: JWTPayload) => boolean {
  return (payload: JWTPayload) => {
    if (!payload) return false;
    if (requiredRoles && !requiredRoles.includes(payload.role)) {
      return false;
    }
    return true;
  };
}
