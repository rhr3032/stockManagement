import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    return errorResponse("Auth endpoint removed", 404);
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse("Failed to get current user", 500);
  }
}
