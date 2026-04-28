import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { mapProductForClient } from "@/lib/product-mapper";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!q || q.length < 2) {
      return successResponse([], "Search query too short");
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      include: {
        category: true,
        supplier: true,
      },
    });

    return successResponse(
      products.map((product) => mapProductForClient(product)),
      "Search results"
    );
  } catch (error) {
    console.error("Search products error:", error);
    return errorResponse("Failed to search products", 500);
  }
}
