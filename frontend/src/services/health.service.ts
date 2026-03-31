import api from './api';
import type { Cycle, Symptom, Mood, Reminder, ChatMessage, ChatResponse } from '../types';

export const cycleService = {
  async getAll(): Promise<Cycle[]> {
    const res = await api.get('/cycles');
    return res.data;
  },
  async getCurrent(): Promise<Cycle | null> {
    const res = await api.get('/cycles/current');
    return res.data;
  },
  async getById(id: string): Promise<Cycle> {
    const res = await api.get(`/cycles/${id}`);
    return res.data;
  },
  async create(data: Partial<Cycle>): Promise<Cycle> {
    const res = await api.post('/cycles', data);
    return res.data;
  },
  async update(id: string, data: Partial<Cycle>): Promise<Cycle> {
    const res = await api.patch(`/cycles/${id}`, data);
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/cycles/${id}`);
  },
};

export const symptomService = {
  async getAll(startDate?: string, endDate?: string): Promise<Symptom[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/symptoms?${params}`);
    return res.data;
  },
  async create(data: Partial<Symptom>): Promise<Symptom> {
    const res = await api.post('/symptoms', data);
    return res.data;
  },
  async update(id: string, data: Partial<Symptom>): Promise<Symptom> {
    const res = await api.patch(`/symptoms/${id}`, data);
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/symptoms/${id}`);
  },
};

export const moodService = {
  async getAll(startDate?: string, endDate?: string): Promise<Mood[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await api.get(`/moods?${params}`);
    return res.data;
  },
  async create(data: Partial<Mood>): Promise<Mood> {
    const res = await api.post('/moods', data);
    return res.data;
  },
  async update(id: string, data: Partial<Mood>): Promise<Mood> {
    const res = await api.patch(`/moods/${id}`, data);
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/moods/${id}`);
  },
};

export const reminderService = {
  async getAll(): Promise<Reminder[]> {
    const res = await api.get('/reminders');
    return res.data;
  },
  async create(data: Partial<Reminder>): Promise<Reminder> {
    const res = await api.post('/reminders', data);
    return res.data;
  },
  async update(id: string, data: Partial<Reminder>): Promise<Reminder> {
    const res = await api.patch(`/reminders/${id}`, data);
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/reminders/${id}`);
  },
};

export const aiService = {
  async chat(message: string): Promise<ChatResponse> {
    const res = await api.post('/ai/chat', { message });
    return res.data;
  },
  async getHistory(): Promise<ChatMessage[]> {
    const res = await api.get('/ai/history');
    return res.data;
  },
  async exportData(): Promise<{ exported: number; resources: unknown[] }> {
    const res = await api.post('/ai/export');
    return res.data;
  },
};
