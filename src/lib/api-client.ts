import { signOut } from 'next-auth/react';

type RequestConfig = RequestInit & {
  baseURL?: string;
  timeout?: number;
};

type Interceptor = {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: Error) => Promise<unknown>;
};

type RequestError = Error & {
  response?: Response;
  config?: RequestConfig;
  endpoint?: string;
};

class FetchInstance {
  private interceptors: Interceptor = {};
  private timeout: number;
  private lastRequest?: { url: string; config: RequestConfig };
  public isRefreshing = false;
  public refreshAttempts = 0;
  public maxRefreshAttempts = 3;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
    endpoint: string;
    config: RequestConfig;
  }> = [];

  constructor(config: { baseURL: string; timeout?: number }) {
    this.timeout = config.timeout || 30000;
  }

  setInterceptors(interceptors: Interceptor) {
    this.interceptors = interceptors;
  }

  public processQueue(error: unknown, _token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject, endpoint, config }) => {
      if (error) {
        reject(error);
      } else {
        resolve(this.request(endpoint, config));
      }
    });

    this.failedQueue = [];
  }

  public addToQueue(endpoint: string, config: RequestConfig): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject, endpoint, config });
    });
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    try {
      this.lastRequest = { url: endpoint, config };
      let requestConfig = { ...config };
      if (this.interceptors.onRequest) {
        requestConfig = await this.interceptors.onRequest(requestConfig);
      }
      const response = await this.fetchWithTimeout(endpoint, requestConfig);

      // Apply response interceptor
      let interceptedResponse = response;
      if (this.interceptors.onResponse) {
        interceptedResponse = await this.interceptors.onResponse(response);
      }

      if (!interceptedResponse.ok) {
        const errorData = await interceptedResponse.json().catch(() => ({}));
        const error = new Error(
          errorData.message || errorData.detail || 'Request failed',
        ) as RequestError;
        error.response = interceptedResponse;
        error.config = requestConfig;
        Object.assign(error, {
          status: interceptedResponse.status,
          statusText: interceptedResponse.statusText,
          data: errorData,
          endpoint,
        });
        throw error;
      }

      return interceptedResponse.json();
    } catch (error) {
      if (this.interceptors.onError) {
        return this.interceptors.onError(error as RequestError) as Promise<T>;
      }
      throw error;
    }
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData
        ? {
            ...config?.headers,
          }
        : {
            'Content-Type': 'application/json',
            ...config?.headers,
          },
    });
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new FetchInstance({
  baseURL: '',
  timeout: 30000,
});

apiClient.setInterceptors({
  onRequest: async (config) => {
    return config;
  },
  onResponse: async (response) => {
    return response;
  },
  onError: async (error: RequestError) => {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout, please try again later');
      }
    }
    if (error.response?.status === 401) {
      const originalConfig = error.config;
      const originalEndpoint = (error as RequestError).endpoint;

      if (originalConfig && originalEndpoint) {
        if (apiClient.refreshAttempts >= apiClient.maxRefreshAttempts) {
          if (typeof window !== 'undefined') {
            signOut({ redirectTo: '/auth/sign-in' });
          }
          throw new Error('Max refresh attempts exceeded');
        }

        if (apiClient.isRefreshing) {
          return apiClient.addToQueue(originalEndpoint, originalConfig);
        }

        apiClient.isRefreshing = true;
        apiClient.refreshAttempts++;

        try {
          const refreshResponse = await fetch('/api/refresh-token', {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            apiClient.refreshAttempts = 0;
            apiClient.processQueue(null, 'refreshed');
            return apiClient.request(originalEndpoint, originalConfig);
          } else {
            const refreshError = new Error('Token refresh failed');
            apiClient.processQueue(refreshError, null);

            if (typeof window !== 'undefined') {
              signOut({ redirectTo: '/auth/sign-in' });
            }
            throw refreshError;
          }
        } catch (refreshError) {
          apiClient.processQueue(refreshError, null);

          if (typeof window !== 'undefined') {
            signOut({ redirectTo: '/auth/sign-in' });
          }
          throw refreshError;
        } finally {
          apiClient.isRefreshing = false;
        }
      }
    }
    throw error;
  },
});

export default apiClient;
