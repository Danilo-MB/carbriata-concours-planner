const TOKEN_KEY = 'carbriata_auth_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
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

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    register: (email: string, password: string, name: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      }),
    me: () =>
      request<{ id: string; email: string; name: string }>('/api/auth/me')
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
