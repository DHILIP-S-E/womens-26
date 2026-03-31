import api from './api';

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  tags: string[];
  createdAt: string;
}

export interface MentorMatch {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  mentor?: MentorProfile;
  createdAt: string;
}

export interface MentorMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  category: 'health' | 'legal' | 'career' | 'safety';
  authorName: string;
  answersCount: number;
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  authorName: string;
  isExpert: boolean;
  upvotes: number;
  hasUpvoted: boolean;
  createdAt: string;
}

export interface QuestionDetail extends Question {
  answers: Answer[];
}

export interface Resource {
  id: string;
  name: string;
  type: 'shelter' | 'legal_aid' | 'clinic' | 'food_bank' | 'support_group';
  address: string;
  city: string;
  country: string;
  phone: string;
  link: string;
  distance?: number;
}

export const mentorService = {
  async createProfile(data: { bio: string; tags: string[] }): Promise<MentorProfile> {
    const res = await api.post('/community/mentors/profile', data);
    return res.data;
  },
  async search(tags?: string[]): Promise<MentorProfile[]> {
    const params = new URLSearchParams();
    if (tags?.length) params.append('tags', tags.join(','));
    const res = await api.get(`/community/mentors/search?${params}`);
    return res.data;
  },
  async requestMatch(mentorId: string): Promise<MentorMatch> {
    const res = await api.post('/community/mentors/match', { mentorId });
    return res.data;
  },
  async respondMatch(matchId: string, status: 'accepted' | 'rejected'): Promise<MentorMatch> {
    const res = await api.patch(`/community/mentors/match/${matchId}`, { status });
    return res.data;
  },
  async sendMessage(matchId: string, content: string): Promise<MentorMessage> {
    const res = await api.post('/community/mentors/messages', { matchId, content });
    return res.data;
  },
  async getMessages(matchId: string): Promise<MentorMessage[]> {
    const res = await api.get(`/community/mentors/messages?matchId=${matchId}`);
    return res.data;
  },
};

export const questionService = {
  async getAll(category?: string): Promise<Question[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const res = await api.get(`/community/questions?${params}`);
    return res.data;
  },
  async getById(id: string): Promise<QuestionDetail> {
    const res = await api.get(`/community/questions/${id}`);
    return res.data;
  },
  async create(data: { title: string; body: string; category: string }): Promise<Question> {
    const res = await api.post('/community/questions', data);
    return res.data;
  },
  async addAnswer(questionId: string, body: string): Promise<Answer> {
    const res = await api.post(`/community/questions/${questionId}/answers`, { body });
    return res.data;
  },
  async upvote(answerId: string): Promise<void> {
    await api.post(`/community/answers/${answerId}/upvote`);
  },
  async removeUpvote(answerId: string): Promise<void> {
    await api.delete(`/community/answers/${answerId}/upvote`);
  },
};

export const resourceService = {
  async getAll(type?: string, country?: string, city?: string): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (country) params.append('country', country);
    if (city) params.append('city', city);
    const res = await api.get(`/community/resources?${params}`);
    return res.data;
  },
  async getNearby(lat: number, lng: number): Promise<Resource[]> {
    const res = await api.get(`/community/resources/nearby?lat=${lat}&lng=${lng}`);
    return res.data;
  },
};
