import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/middleware";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  notFoundResponse,
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

    const invoice = await prisma.invoiceMain.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        paymentMethod: true,
        soldByUser: {
          select: {
            id: true,
            name: true,
          },
        },
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
