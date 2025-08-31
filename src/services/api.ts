const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Derive API origin (without /api) to build absolute asset URLs like /uploads/...
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/i, '');

// Auth token management
let authToken: string | null = localStorage.getItem('authToken');

const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Base fetch function with error handling
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  verify: async () => {
    return await apiFetch('/auth/verify', {
      method: 'POST',
    });
  },

  logout: () => {
    setAuthToken(null);
  },
};

// Media API
export const mediaAPI = {
  getAll: async (filters?: { category?: string; type?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    return await apiFetch(`/media${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: number) => {
    return await apiFetch(`/media/${id}`);
  },

  upload: async (formData: FormData) => {
    const url = `${API_BASE_URL}/media`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },

  update: async (id: number, updateData: any) => {
    return await apiFetch(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  delete: async (id: number) => {
    return await apiFetch(`/media/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return await apiFetch('/media/stats/overview');
  },
};

// Contact API
export const contactAPI = {
  submit: async (contactData: {
    name: string;
    email: string;
    phone: string;
    service?: string;
    message: string;
  }) => {
    return await apiFetch('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  getAll: async (filters?: { status?: string; service?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.service) params.append('service', filters.service);

    const queryString = params.toString();
    return await apiFetch(`/contact${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: number) => {
    return await apiFetch(`/contact/${id}`);
  },

  update: async (id: number, updateData: any) => {
    return await apiFetch(`/contact/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  delete: async (id: number) => {
    return await apiFetch(`/contact/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return await apiFetch('/contact/stats/overview');
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    return await apiFetch('/settings');
  },

  update: async (settingsData: any) => {
    return await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return await apiFetch('/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return await apiFetch('/health');
  },
};

export { setAuthToken };
// Helper to convert relative paths from API (e.g., /uploads/...) into absolute URLs
export const assetUrl = (path: string): string => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
};