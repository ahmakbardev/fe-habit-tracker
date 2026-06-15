import api from './axios';

export const AuthService = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.data.token;
    localStorage.setItem('auth_token', token);
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  async me() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
