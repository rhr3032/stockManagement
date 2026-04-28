import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Get today's sales
    const todayInvoices = await prisma.invoiceMain.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      select: { grandTotal: true },
    });

    const todaySales = todayInvoices.reduce(
      (sum, inv) => sum + inv.grandTotal,
      0
    );
    const todayInvoiceCount = todayInvoices.length;

    // Get monthly sales
    const monthlyInvoices = await prisma.invoiceMain.findMany({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
      select: { grandTotal: true },
    });

    const monthlySales = monthlyInvoices.reduce(
      (sum, inv) => sum + inv.grandTotal,
      0
    );

    // Get customer count
    const totalCustomers = await prisma.customer.count();

    // Get total invoices
    const totalInvoices = await prisma.invoiceMain.count();

    // Get low stock products (less than 10 units)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockQty: {
          lt: 10,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQty: true,
        salePrice: true,
      },
      orderBy: { stockQty: "asc" },
      take: 10,
    });

    // Get recent invoices
    const recentInvoices = await prisma.invoiceMain.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        paymentMethod: true,
      },
    });

    // Get total products
    const totalProducts = await prisma.product.count();

    const stats = {
      sales: {
        today: todaySales,
        todayInvoiceCount,
        thisMonth: monthlySales,
      },
      inventory: {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
      },
      customers: {
        total: totalCustomers,
      },
      invoices: {
        total: totalInvoices,
        recent: recentInvoices,
      },
    };

    return successResponse(stats, "Dashboard stats fetched");
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return errorResponse("Failed to fetch dashboard stats", 500);
  }
}
