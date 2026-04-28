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

    const methods = await prisma.paymentMethod.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return successResponse(methods, "Payment methods fetched");
  } catch (error) {
    console.error("Get payment methods error:", error);
    return errorResponse("Failed to fetch payment methods", 500);
  }
}
