import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    let settings = await prisma.shopSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.shopSettings.create({
        data: {
          shopName: "My Shop",
          invoicePrefix: "INV",
        },
      });
    }

    return successResponse(settings, "Settings fetched");
  } catch (error) {
    console.error("Get settings error:", error);
    return errorResponse("Failed to fetch settings", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    let settings = await prisma.shopSettings.findFirst();

    if (!settings) {
      settings = await prisma.shopSettings.create({
        data: body,
      });
    } else {
      settings = await prisma.shopSettings.update({
        where: { id: settings.id },
        data: body,
      });
    }

    return successResponse(settings, "Settings updated");
  } catch (error) {
    console.error("Update settings error:", error);
    return errorResponse("Failed to update settings", 500);
  }
}
