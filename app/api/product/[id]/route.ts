import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/middleware";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!product) {
      return notFoundResponse("Product");
    }

    return successResponse(product, "Product fetched");
  } catch (error) {
    console.error("Get product error:", error);
    return errorResponse("Failed to fetch product", 500);
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

    if (auth.role !== "ADMIN") {
      return forbiddenResponse();
    }

    const body = await req.json();

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        sku: body.sku,
        categoryId: body.categoryId,
        buyPrice: body.buyPrice,
        salePrice: body.salePrice,
        stockQty: body.stockQty,
        taxPercent: body.taxPercent,
        supplierId: body.supplierId,
        image: body.image,
        status: body.status,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return successResponse(product, "Product updated");
  } catch (error) {
    console.error("Update product error:", error);
    if ((error as any).code === "P2025") {
      return notFoundResponse("Product");
    }
    return errorResponse("Failed to update product", 500);
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

    if (auth.role !== "ADMIN") {
      return forbiddenResponse();
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return successResponse({ id: params.id }, "Product deleted");
  } catch (error) {
    console.error("Delete product error:", error);
    if ((error as any).code === "P2025") {
      return notFoundResponse("Product");
    }
    return errorResponse("Failed to delete product", 500);
  }
}
