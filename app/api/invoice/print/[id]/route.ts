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
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        customer: true,
        paymentMethod: true,
      },
    });

    if (!invoice) {
      return notFoundResponse("Invoice");
    }

    const settings = await prisma.shopSettings.findFirst();

    // Format printable data
    const printableData = {
      // Shop Info
      shop: {
        name: settings?.shopName,
        address: settings?.address,
        phone: settings?.phone,
        logo: settings?.logo,
        footerText: settings?.footerText,
      },
      // Invoice Info
      invoice: {
        number: invoice.invoiceNo,
        date: invoice.createdAt,
        time: invoice.createdAt.toLocaleTimeString("en-US"),
      },
      // Customer Info
      customer: invoice.customer
        ? {
            name: invoice.customer.name,
            phone: invoice.customer.phone,
            email: invoice.customer.email,
            address: invoice.customer.address,
          }
        : null,
      // Items
      items: invoice.items.map((item) => ({
        name: item.product.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      // Summary
      summary: {
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        vat: invoice.vatTax,
        grandTotal: invoice.grandTotal,
        paidAmount: invoice.paidAmount,
        dueAmount: invoice.dueAmount,
        paymentMethod: invoice.paymentMethod.name,
        change: Math.max(0, invoice.paidAmount - invoice.grandTotal),
      },
    };

    return successResponse(printableData, "Printable invoice data");
  } catch (error) {
    console.error("Get printable invoice error:", error);
    return errorResponse("Failed to fetch printable invoice", 500);
  }
}
