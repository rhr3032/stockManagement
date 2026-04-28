import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/middleware";
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          category: true,
          supplier: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    return successResponse(
      {
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      "Products fetched"
    );
  } catch (error) {
    console.error("Get products error:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}
