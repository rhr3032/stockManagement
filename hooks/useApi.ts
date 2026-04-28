import { useState, useCallback } from "react";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface UseApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }, []);

  const call = useCallback(
    async <T = any,>(
      endpoint: string,
      options: UseApiOptions = {}
    ): Promise<ApiResponse<T> | null> => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...options.headers,
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
          method: options.method || "GET",
          headers,
          body:
            options.method && options.method !== "GET" && options.body
              ? JSON.stringify(options.body)
              : undefined,
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
          const errorMsg =
            data.error || `HTTP ${response.status}: ${response.statusText}`;
          setError(errorMsg);
          return null;
        }

        return data;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to fetch";
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const get = useCallback(
    async <T = any,>(endpoint: string) =>
      call<T>(endpoint, { method: "GET" }),
    [call]
  );

  const post = useCallback(
    async <T = any,>(endpoint: string, data: any) =>
      call<T>(endpoint, { method: "POST", body: data }),
    [call]
  );

  const put = useCallback(
    async <T = any,>(endpoint: string, data: any) =>
      call<T>(endpoint, { method: "PUT", body: data }),
    [call]
  );

  const remove = useCallback(
    async <T = any,>(endpoint: string) =>
      call<T>(endpoint, { method: "DELETE" }),
    [call]
  );

  return {
    loading,
    error,
    get,
    post,
    put,
    remove,
    delete: remove,
  };
}
