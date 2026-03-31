import api from './api';
import type { TrustedContact, SOSAlert, SafeWalk, Incident, NearbyIncidents } from '../types';

export const sosService = {
  async trigger(data: { latitude: number; longitude: number }): Promise<SOSAlert> {
    const res = await api.post('/safety/sos', data);
    return res.data;
  },
  async getHistory(): Promise<SOSAlert[]> {
    const res = await api.get('/safety/sos');
    return res.data;
  },
};

export const contactService = {
  async getAll(): Promise<TrustedContact[]> {
    const res = await api.get('/safety/contacts');
    return res.data;
  },
  async create(data: Partial<TrustedContact>): Promise<TrustedContact> {
    const res = await api.post('/safety/contacts', data);
    return res.data;
  },
  async update(id: string, data: Partial<TrustedContact>): Promise<TrustedContact> {
    const res = await api.patch(`/safety/contacts/${id}`, data);
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/safety/contacts/${id}`);
  },
};

export const walkService = {
  async start(data: { destination: string; expectedArrival: string; latitude: number; longitude: number }): Promise<SafeWalk> {
    const res = await api.post('/safety/walk/start', data);
    return res.data;
  },
  async updateLocation(id: string, data: { latitude: number; longitude: number }): Promise<SafeWalk> {
    const res = await api.patch(`/safety/walk/${id}/location`, data);
    return res.data;
  },
  async complete(id: string): Promise<SafeWalk> {
    const res = await api.post(`/safety/walk/${id}/complete`);
    return res.data;
  },
  async getActive(): Promise<SafeWalk | null> {
    const res = await api.get('/safety/walk/active');
    return res.data;
  },
};

export const incidentService = {
  async report(data: { type: string; severity: number; latitude: number; longitude: number; description?: string }): Promise<Incident> {
    const res = await api.post('/safety/incidents', data);
    return res.data;
  },
  async getNearby(latitude: number, longitude: number): Promise<NearbyIncidents> {
    const res = await api.get(`/safety/incidents/nearby?latitude=${latitude}&longitude=${longitude}`);
    return res.data;
  },
};
