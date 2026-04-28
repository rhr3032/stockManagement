import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function successResponse<T>(
  data: T,
  message = "Success",
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function createdResponse<T>(
  data: T,
  message = "Created successfully"
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}

export function notFoundResponse(resource = "Resource"): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse("Unauthorized", 401);
}

export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse("Forbidden", 403);
}

export function validationErrorResponse(
  error: string
): NextResponse<ApiResponse> {
  return errorResponse(error, 422);
}

export function internalErrorResponse(): NextResponse<ApiResponse> {
  return errorResponse("Internal server error", 500);
}
