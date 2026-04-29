import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    return errorResponse("Auth endpoint removed", 404);
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Failed to login", 500);
  }
}
