import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/middleware";
import {
  createdResponse,
  unauthorizedResponse,
  errorResponse,
  validationErrorResponse,
  forbiddenResponse,
} from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse();
    }

    if (auth.role !== "ADMIN") {
      return forbiddenResponse();
    }

    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return validationErrorResponse("Payment method name is required");
    }

    // Check if already exists
    const existing = await prisma.paymentMethod.findUnique({
      where: { name },
    });

    if (existing) {
      return errorResponse("Payment method already exists", 409);
    }

    const method = await prisma.paymentMethod.create({
      data: { name: name.trim() },
    });

    return createdResponse(method, "Payment method created");
  } catch (error) {
    console.error("Create payment method error:", error);
    return errorResponse("Failed to create payment method", 500);
  }
}
