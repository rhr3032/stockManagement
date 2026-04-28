import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createdResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { validateSupplierForm } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    // Validate
    const validation = validateSupplierForm(body);
    if (!validation.valid) {
      return validationErrorResponse(
        Object.values(validation.errors).join(", ")
      );
    }

    const { name, phone, company, address } = body;

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { name },
    });

    if (existingSupplier) {
      return errorResponse("Supplier with this name already exists", 409);
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone,
        company,
        address,
      },
    });

    return createdResponse(supplier, "Supplier created successfully");
  } catch (error) {
    console.error("Create supplier error:", error);
    return errorResponse("Failed to create supplier", 500);
  }
}
