import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "@/lib/auth";
import {
  errorResponse,
  validationErrorResponse,
  createdResponse,
} from "@/lib/api-response";
import { validateEmail, validatePassword } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = "CASHIER" } = body;

    // Validation
    if (!name || !email || !password) {
      return validationErrorResponse("Name, email, and password are required");
    }

    if (!validateEmail(email)) {
      return validationErrorResponse("Invalid email address");
    }

    if (!validatePassword(password)) {
      return validationErrorResponse("Password must be at least 6 characters");
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("User with this email already exists", 409);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return createdResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      "User registered successfully"
    );
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Failed to register user", 500);
  }
}
