import api from './api';

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: string;
  createdAt: string;
}

export const financialService = {
  async getGoals(): Promise<FinancialGoal[]> {
    const res = await api.get('/financial/goals');
    return res.data;
  },
  async createGoal(data: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const res = await api.post('/financial/goals', data);
    return res.data;
  },
  async updateGoal(id: string, data: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const res = await api.patch(`/financial/goals/${id}`, data);
    return res.data;
  },
  async deleteGoal(id: string): Promise<void> {
    await api.delete(`/financial/goals/${id}`);
  },
};
