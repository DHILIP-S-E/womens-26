import api from './api';

// Fertility
export const fertilityService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/fertility');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/fertility', data);
    return res.data;
  },
};

export const ivfService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/ivf');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/ivf', data);
    return res.data;
  },
};

// Pregnancy
export const pregnancyService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/pregnancy');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/pregnancy', data);
    return res.data;
  },
};

export const contractionService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/contractions');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/contractions', data);
    return res.data;
  },
};

export const kickService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/kicks');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/kicks', data);
    return res.data;
  },
};

export const birthPlanService = {
  async create(data: any): Promise<any> {
    const res = await api.post('/health/birth-plan', data);
    return res.data;
  },
};

// Postpartum
export const epdsService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/epds');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/epds', data);
    return res.data;
  },
};

export const feedingService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/feeding');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/feeding', data);
    return res.data;
  },
};

export const babySleepService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/baby-sleep');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/baby-sleep', data);
    return res.data;
  },
};

// Menopause
export const hotFlashService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/hot-flashes');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/hot-flashes', data);
    return res.data;
  },
  async getStats(): Promise<any> {
    const res = await api.get('/health/hot-flashes/stats');
    return res.data;
  },
};

// Grief
export const griefService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/health/grief');
    return res.data;
  },
  async create(data: any): Promise<any> {
    const res = await api.post('/health/grief', data);
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/health/grief/${id}`);
  },
};

// Crisis / Mental Health
export const crisisService = {
  async getResources(): Promise<any[]> {
    const res = await api.get('/mental-health/crisis/resources');
    return res.data;
  },
};

export const therapistService = {
  async getAll(params?: { speciality?: string; country?: string; language?: string; mode?: string }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.speciality) searchParams.append('speciality', params.speciality);
    if (params?.country) searchParams.append('country', params.country);
    if (params?.language) searchParams.append('language', params.language);
    if (params?.mode) searchParams.append('mode', params.mode);
    const res = await api.get(`/mental-health/therapists?${searchParams}`);
    return res.data;
  },
  async favourite(id: string): Promise<void> {
    await api.post(`/mental-health/therapists/${id}/favourite`);
  },
  async unfavourite(id: string): Promise<void> {
    await api.delete(`/mental-health/therapists/${id}/favourite`);
  },
};
