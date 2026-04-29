import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const customer = await prisma.customer.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.customer.delete({
      where: { id },
    });

    return successResponse({ id }, "Customer deleted");
  } catch (error) {
    console.error("Delete customer error:", error);
    if ((error as any).code === "P2025") {
      return notFoundResponse("Customer");
    }
    return errorResponse("Failed to delete customer", 500);
  }
}
