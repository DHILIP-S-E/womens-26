import api from './api';

export interface SalaryBenchmark {
  role: string;
  country: string;
  experienceLevel: string;
  minSalary: number;
  maxSalary: number;
  medianSalary: number;
  currency: string;
}

export interface CareerMilestone {
  id: string;
  type: 'promotion' | 'pay_rise' | 'new_job' | 'certification' | 'other';
  title: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface BurnoutAssessment {
  id: string;
  exhaustion: number;
  cynicism: number;
  inefficacy: number;
  totalScore: number;
  level: 'low' | 'moderate' | 'high';
  createdAt: string;
}

export const careerService = {
  async getSalary(role: string, country: string, experienceLevel: string): Promise<SalaryBenchmark> {
    const params = new URLSearchParams({ role, country, experienceLevel });
    const res = await api.get(`/career/salary?${params}`);
    return res.data;
  },
  async getMilestones(): Promise<CareerMilestone[]> {
    const res = await api.get('/career/milestones');
    return res.data;
  },
  async createMilestone(data: Partial<CareerMilestone>): Promise<CareerMilestone> {
    const res = await api.post('/career/milestones', data);
    return res.data;
  },
  async submitBurnout(data: { exhaustion: number; cynicism: number; inefficacy: number }): Promise<BurnoutAssessment> {
    const res = await api.post('/career/burnout', data);
    return res.data;
  },
  async getBurnoutHistory(): Promise<BurnoutAssessment[]> {
    const res = await api.get('/career/burnout/history');
    return res.data;
  },
};
