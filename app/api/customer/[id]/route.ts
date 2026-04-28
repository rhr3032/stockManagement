import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/middleware";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse();
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      return notFoundResponse("Customer");
    }

    return successResponse(customer, "Customer fetched");
  } catch (error) {
    console.error("Get customer error:", error);
    return errorResponse("Failed to fetch customer", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await req.json();

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
      },
    });

    return successResponse(customer, "Customer updated");
  } catch (error) {
    console.error("Update customer error:", error);
    if ((error as any).code === "P2025") {
      return notFoundResponse("Customer");
    }
    return errorResponse("Failed to update customer", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse();
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return successResponse({ id: params.id }, "Customer deleted");
  } catch (error) {
    console.error("Delete customer error:", error);
    if ((error as any).code === "P2025") {
      return notFoundResponse("Customer");
    }
    return errorResponse("Failed to delete customer", 500);
  }
}
