import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoiceMain.findMany({
        skip,
        take: limit,
        include: {
          items: true,
          customer: true,
          paymentMethod: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoiceMain.count(),
    ]);

    return successResponse(
      {
        invoices,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      "Invoices fetched"
    );
  } catch (error) {
    console.error("Get invoices error:", error);
    return errorResponse("Failed to fetch invoices", 500);
  }
}
