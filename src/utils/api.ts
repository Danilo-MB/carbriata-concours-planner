const TOKEN_KEY = 'mapflex_auth_token';
const LEGACY_TOKEN_KEY = 'carbriata_auth_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }
  } catch {
    // no-op
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errMsg = `Error ${res.status}`;
    try {
      const errData = await res.json();
      errMsg = errData.message || errMsg;
    } catch {
      // no-op
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export interface UserResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: 'admin' | 'user';
    isAdmin?: boolean;
  };
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<UserResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    register: (email: string, password: string, name: string) =>
      request<UserResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      }),
    google: (data: { credential?: string; email?: string; name?: string; sub?: string }) =>
      request<UserResponse>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    apple: (data: { credential?: string; email?: string; name?: string; sub?: string }) =>
      request<UserResponse>('/api/auth/apple', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    sendMagicLink: (email: string) =>
      request<{ success: boolean; email: string; devCode?: string; devLink?: string }>('/api/auth/magic-link/send', {
        method: 'POST',
        body: JSON.stringify({ email, origin: window.location.origin })
      }),
    verifyMagicToken: (token: string) =>
      request<UserResponse>('/api/auth/magic-link/verify', {
        method: 'POST',
        body: JSON.stringify({ token })
      }),
    verifyMagicCode: (email: string, code: string) =>
      request<UserResponse>('/api/auth/magic-link/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      }),
    me: () =>
      request<{ id: string; email: string; name: string; role?: 'admin' | 'user'; isAdmin?: boolean }>('/api/auth/me')
  },
  projects: {
    list: () => request<any[]>('/api/projects'),
    get: (id: string) => request<any>(`/api/projects/${id}`),
    create: (data: any) =>
      request<any>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: string, patch: any) =>
      request<any>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch)
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/projects/${id}`, {
        method: 'DELETE'
      }),
    syncFeatures: (projectId: string, features: any[]) =>
      request<any>(`/api/projects/${projectId}/features`, {
        method: 'PUT',
        body: JSON.stringify({ features })
      })
  }
};
