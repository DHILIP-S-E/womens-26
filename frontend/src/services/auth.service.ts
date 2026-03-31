import api from './api';
import type { AuthResult, User } from '../types';

export const authService = {
  async signup(data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber?: string;
  }): Promise<AuthResult> {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResult> {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
