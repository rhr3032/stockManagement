import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createdResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { validateProductForm } from "@/lib/validation";
import { mapProductForClient } from "@/lib/product-mapper";

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    // Validate
    const validation = validateProductForm(body);
    if (!validation.valid) {
      return validationErrorResponse(
        Object.values(validation.errors).join(", ")
      );
    }

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

    const resolvedCategoryId = normalizedCategoryId ?? defaultCategory!.id;

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

    const {
    const {
      name,
      buyPrice,
      salePrice,
      stockQty = 0,
      image,
      unit,
    } = body;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        categoryId: resolvedCategoryId,
        buyPrice,
        salePrice,
        stockQty
      include: {
        category: true,
        supplier: true,
      },
    });

    return createdResponse(
      mapProductForClient(product),
      "Product created successfully"
    );
  } catch (error) {
    console.error("Create product error:", error);
    return errorResponse("Failed to create product", 500);
  }
}
