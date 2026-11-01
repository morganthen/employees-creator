export type ValidationDetails = Record<string, string[]>;

/**
 * Thrown for any non-2xx response. `details` carries the backend's
 * field-level validation map (400 from GlobalExceptionHandler).
 */
export class ApiError extends Error {
  status: number;
  details?: ValidationDetails;

  constructor(message: string, status: number, details?: ValidationDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function toApiError(
  res: Response,
  fallback: string,
): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  return new ApiError(
    body?.message ?? fallback,
    res.status,
    body?.details ?? undefined,
  );
}
