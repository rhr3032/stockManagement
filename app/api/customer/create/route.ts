import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/middleware";
import {
  createdResponse,
  unauthorizedResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { validateCustomerForm } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await req.json();

    // Validate
    const validation = validateCustomerForm(body);
    if (!validation.valid) {
      return validationErrorResponse(
        Object.values(validation.errors).join(", ")
      );
    }

    const { name, phone, email, address } = body;

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        address,
      },
    });

    return createdResponse(customer, "Customer created successfully");
  } catch (error) {
    console.error("Create customer error:", error);
    return errorResponse("Failed to create customer", 500);
  }
}
