import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    return errorResponse("Auth endpoint removed", 404);
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Failed to register user", 500);
  }
}
