import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        products: true,
      },
    });

    if (!supplier) {
      return notFoundResponse("Supplier");
    }

    return successResponse(supplier, "Supplier fetched");
  } catch (error) {
    console.error("Get supplier error:", error);
    return errorResponse("Failed to fetch supplier", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name: body.name,
        phone: body.phone,
        company: body.company,
        address: body.address,
      },
    });

    return successResponse(supplier, "Supplier updated");
  } catch (error) {
    console.error("Update supplier error:", error);
    if ((error as any).code === "P2025") {
      return notFoundResponse("Supplier");
    }
    return errorResponse("Failed to update supplier", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    await prisma.supplier.delete({
      where: { id: params.id },
    });

    return successResponse({ id: params.id }, "Supplier deleted");
  } catch (error) {
    console.error("Delete supplier error:", error);
    if ((error as any).code === "P2025") {
      return notFoundResponse("Supplier");
    }
    return errorResponse("Failed to delete supplier", 500);
  }
}
