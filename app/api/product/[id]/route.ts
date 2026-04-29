import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { mapProductForClient } from "@/lib/product-mapper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!product) {
      return notFoundResponse("Product");
    }

    return successResponse(mapProductForClient(product), "Product fetched");
  } catch (error) {
    console.error("Get product error:", error);
    return errorResponse("Failed to fetch product", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const normalizedCategoryId =
      typeof body.categoryId === "string" && body.categoryId.trim()
        ? body.categoryId
        : undefined;

    const defaultCategory = !normalizedCategoryId
      ? await prisma.category.upsert({
          where: { name: "General" },
          update: {},
          create: { name: "General" },
        })
      : null;

    const normalizedSupplierName =
      typeof body.supplierName === "string" && body.supplierName.trim()
        ? body.supplierName.trim()
        : undefined;

    const resolvedSupplierId = body.supplierId
      ? body.supplierId
      : normalizedSupplierName
      ? (
          await prisma.supplier.upsert({
            where: { name: normalizedSupplierName },
            update: {},
            create: {
              name: normalizedSupplierName,
              phone: "N/A",
            },
          })
        ).id
      : undefined;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        categoryId: normalizedCategoryId ?? defaultCategory?.id,
        buyPrice: body.buyPrice,
        salePrice: body.salePrice,
        stockQty: body.stockQty,
        supplierId: resolvedSupplierId,
        image: body.image,
        status: body.status,
        unit:
          typeof body.unit === "string" && body.unit.trim()
            ? body.unit.trim()
            : null,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return successResponse(mapProductForClient(product), "Product updated");
  } catch (error) {
    console.error("Update product error:", error);
    if ((error as { code?: string }).code === "P2025") {
      return notFoundResponse("Product");
    }
    return errorResponse("Failed to update product", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return successResponse({ id }, "Product deleted");
  } catch (error) {
    console.error("Delete product error:", error);
    if ((error as { code?: string }).code === "P2025") {
      return notFoundResponse("Product");
    }
    return errorResponse("Failed to delete product", 500);
  }
}
