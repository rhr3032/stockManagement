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
import { validateProductForm } from "@/lib/validation";

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

    // Validate
    const validation = validateProductForm(body);
    if (!validation.valid) {
      return validationErrorResponse(
        Object.values(validation.errors).join(", ")
      );
    }

    const {
      name,
      sku,
      categoryId,
      buyPrice,
      salePrice,
      stockQty = 0,
      taxPercent = 0,
      supplierId,
      image,
    } = body;

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return errorResponse("Product with this SKU already exists", 409);
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId,
        buyPrice,
        salePrice,
        stockQty,
        taxPercent,
        supplierId,
        image,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return createdResponse(product, "Product created successfully");
  } catch (error) {
    console.error("Create product error:", error);
    return errorResponse("Failed to create product", 500);
  }
}
