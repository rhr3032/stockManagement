import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/middleware";
import {
  createdResponse,
  unauthorizedResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

interface InvoiceItemInput {
  productId: string;
  qty: number;
  unitPrice: number;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const {
      customerId,
      items,
      subtotal,
      discount = 0,
      vatTax = 0,
      paidAmount = 0,
      paymentMethodId,
      notes,
    } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return validationErrorResponse("Invoice items are required");
    }

    if (!paymentMethodId) {
      return validationErrorResponse("Payment method is required");
    }

    if (typeof subtotal !== "number" || subtotal < 0) {
      return validationErrorResponse("Valid subtotal is required");
    }

    // Validate and fetch all products
    const productIds = items.map((item: InvoiceItemInput) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      return errorResponse("Some products not found", 404);
    }

    // Check stock availability
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || product.stockQty < item.qty) {
        return errorResponse(
          `Insufficient stock for ${product?.name || "product"}`,
          400
        );
      }
    }

    // Calculate grand total
    const grandTotal = subtotal + vatTax - discount;
    const dueAmount = Math.max(0, grandTotal - paidAmount);

    // Get settings for invoice number
    const settings = await prisma.shopSettings.findFirst();
    const invoicePrefix = settings?.invoicePrefix || "INV";
    const lastInvoice = await prisma.invoiceMain.findFirst({
      orderBy: { createdAt: "desc" },
      select: { invoiceNo: true },
    });

    let invoiceNumber = 1;
    if (lastInvoice) {
      const match = lastInvoice.invoiceNo.match(/\d+$/);
      if (match) {
        invoiceNumber = parseInt(match[0]) + 1;
      }
    }
    const invoiceNo = `${invoicePrefix}${String(invoiceNumber).padStart(6, "0")}`;

    // Create invoice with items and stock deduction in transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const createdInvoice = await tx.invoiceMain.create({
        data: {
          invoiceNo,
          customerId,
          subtotal,
          discount,
          vatTax,
          grandTotal,
          paidAmount,
          dueAmount,
          paymentMethodId,
          soldByUserId: auth.userId,
          notes,
        },
      });

      // Create invoice items and deduct stock
      for (const item of items) {
        const product = productMap.get(item.productId)!;

        await tx.invoiceItem.create({
          data: {
            invoiceId: createdInvoice.id,
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            totalPrice: item.qty * item.unitPrice,
          },
        });

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: {
              decrement: item.qty,
            },
          },
        });

        // Create stock log
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            type: "SALE",
            qty: -item.qty,
            referenceInvoiceId: createdInvoice.id,
            createdByUserId: auth.userId,
          },
        });
      }

      // Update customer due balance
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            dueBalance: {
              increment: dueAmount,
            },
          },
        });
      }

      return createdInvoice;
    });

    // Fetch complete invoice with items
    const completeInvoice = await prisma.invoiceMain.findUnique({
      where: { id: invoice.id },
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

    return createdResponse(completeInvoice, "Invoice created successfully");
  } catch (error) {
    console.error("Create invoice error:", error);
    return errorResponse("Failed to create invoice", 500);
  }
}
