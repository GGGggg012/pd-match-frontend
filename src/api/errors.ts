export type ApiErrorCode = 'NETWORK' | 'TIMEOUT' | 'HTTP' | 'UNKNOWN'

export class ApiError extends Error {
  code: ApiErrorCode
  status?: number
  details?: unknown

  constructor(message: string, code: ApiErrorCode, options?: { status?: number; details?: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = options?.status
    this.details = options?.details
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }
  if (error instanceof Error) {
    return new ApiError(error.message, 'UNKNOWN')
  }
  return new ApiError('Unexpected API error', 'UNKNOWN', { details: error })
}
