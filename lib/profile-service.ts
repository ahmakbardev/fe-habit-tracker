import api from './axios';

export interface ProfileData {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  member_since: string;
  last_edited: string;
  job_title: string | null;
  company: string | null;
  phone_mobile: string | null;
  phone_work: string | null;
  mailing_address: string | null;
  timezone: string | null;
  birthday: string | null;
  tags: string[];
  stats: {
    notes: number;
    habits: number;
    tasks: number;
  };
}

export type ProfileUpdatePayload = Partial<{
  name: string;
  username: string;
  bio: string | null;
  job_title: string | null;
  company: string | null;
  phone_mobile: string | null;
  phone_work: string | null;
  mailing_address: string | null;
  timezone: string | null;
  birthday: string | null;
  tags: string[];
}>;

export function resolveAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');
  return `${base}${avatarUrl}`;
}

export const ProfileService = {
  async get(): Promise<ProfileData> {
    const res = await api.get('/profile');
    return res.data.data;
  },

  async update(data: ProfileUpdatePayload): Promise<ProfileData> {
    const res = await api.patch('/profile', data);
    return res.data.data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.avatar_url;
  },

  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await api.patch('/profile/password', data);
  },
};
