import { NextResponse } from "next/server";

// Standard API success response
export function successResponse<T>(
  data: T,
  statusCode = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  );
}

// Standard API error response
export function errorResponse(
  error: { code: string; message: string },
  statusCode = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status: statusCode }
  );
}

// Standard API error types
export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

// Standard API success type
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

// Combined API response type
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Common error codes
export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CONFLICT = "CONFLICT",
}
