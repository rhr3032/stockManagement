import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/middleware";
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);

    if (!auth) {
      return unauthorizedResponse();
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse(user, "Current user fetched");
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse("Failed to get current user", 500);
  }
}
