const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const API_BASE_URL = rawBaseUrl?.replace(/\/$/, '') ?? '';
export const isRemoteApiEnabled = API_BASE_URL.length > 0;

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isRemoteApiEnabled) {
    throw new ApiError('Remote API is not configured', 503, 'NO_API');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: init?.signal ?? controller.signal,
    });

    if (!response.ok) {
      try {
        const body = (await response.json()) as {
          error?: { code?: string; message?: string };
        };
        throw new ApiError(
          body.error?.message ?? response.statusText,
          response.status,
          body.error?.code,
        );
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(response.statusText, response.status);
      }
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}
