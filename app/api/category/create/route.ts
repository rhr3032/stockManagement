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
      return validationErrorResponse("Category name is required");
    }

    const existing = await prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      return errorResponse("Category already exists", 409);
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });

    return createdResponse(category, "Category created");
  } catch (error) {
    console.error("Create category error:", error);
    return errorResponse("Failed to create category", 500);
  }
}
