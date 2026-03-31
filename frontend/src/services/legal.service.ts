import api from './api';

export interface LegalArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  country: string;
  summary: string;
  createdAt: string;
}

export interface DivorceRule {
  id: string;
  country: string;
  title: string;
  content: string;
  waitingPeriod: string;
  grounds: string[];
}

export const legalService = {
  async getContent(country: string, category?: string): Promise<LegalArticle[]> {
    const params = new URLSearchParams({ country });
    if (category) params.append('category', category);
    const res = await api.get(`/legal/content?${params}`);
    return res.data;
  },
  async search(query: string, country?: string): Promise<LegalArticle[]> {
    const params = new URLSearchParams({ query });
    if (country) params.append('country', country);
    const res = await api.get(`/legal/search?${params}`);
    return res.data;
  },
  async getDivorceRules(country: string): Promise<DivorceRule[]> {
    const res = await api.get(`/legal/divorce-rules?country=${country}`);
    return res.data;
  },
};
