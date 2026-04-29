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
    const invoice = await prisma.invoiceMain.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        paymentMethod: true,
      },
    });

    if (!invoice) {
      return notFoundResponse("Invoice");
    }

    return successResponse(invoice, "Invoice fetched");
  } catch (error) {
    console.error("Get invoice error:", error);
    return errorResponse("Failed to fetch invoice", 500);
  }
}
