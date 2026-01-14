import { AUTH_API } from '@/shared/env';
import { readSession } from '@/utils';

type RequestConfig = RequestInit & {
  baseURL?: string;
  timeout?: number;
};

type Interceptor = {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: Error) => Promise<never>;
};

type RequestError = Error & {
  status?: number;
  response?: Response;
  config?: RequestConfig;
};

class FetchInstance {
  private interceptors: Interceptor = {};
  private baseURL: string;
  private timeout: number;

  constructor(config: { baseURL: string; timeout?: number }) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
  }

  setInterceptors(interceptors: Interceptor) {
    this.interceptors = interceptors;
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
      let requestConfig = { ...config };
      if (this.interceptors.onRequest) {
        requestConfig = await this.interceptors.onRequest(requestConfig);
      }

      const url = `${this.baseURL}${endpoint}`;
      const response = await this.fetchWithTimeout(url, requestConfig);

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

      if (interceptedResponse.status === 204) {
        return {} as T;
      }

      return interceptedResponse.json();
    } catch (error) {
      if (this.interceptors.onError) {
        return this.interceptors.onError(error as RequestError);
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
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
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

export const api = new FetchInstance({
  baseURL: `${AUTH_API}/api`,
  timeout: 30000,
});

api.setInterceptors({
  onRequest: async (config) => {
    const session = await readSession();
    const token = session?.user?.access;
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  onResponse: async (response) => {
    return response;
  },
  onError: async (error: RequestError) => {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout, Please try again later');
      }
    }
    throw error;
  },
});

export default api;
