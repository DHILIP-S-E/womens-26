export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  timezone?: string;
  preferences?: { darkMode: boolean; notificationsEnabled: boolean; healthLakeExportEnabled: boolean };
  createdAt?: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface Cycle {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number;
  periodLength: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Symptom {
  id: string;
  userId: string;
  cycleId: string | null;
  date: string;
  type: string;
  severity: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mood {
  id: string;
  userId: string;
  date: string;
  mood: string;
  intensity: number;
  triggers: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  scheduledTime: string;
  frequency: string;
  isActive: boolean;
  notificationMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  context: unknown;
  createdAt: string;
}

export interface ChatResponse {
  response: string;
  context: {
    recentMoods: Array<{ mood: string; intensity: number; date: string }>;
    recentSymptoms: Array<{ type: string; severity: number; date: string }>;
    currentCycle: { startDate: string; endDate: string | null; cycleLength: number } | null;
  };
}

// Safety domain types
export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  contactsNotified: number;
  status: string;
  createdAt: string;
}

export interface SafeWalk {
  id: string;
  userId: string;
  destination: string;
  expectedArrival: string;
  startLatitude: number;
  startLongitude: number;
  status: 'active' | 'completed' | 'expired';
  shareLink: string;
  createdAt: string;
  completedAt?: string;
}

export interface Incident {
  id: string;
  type: string;
  severity: number;
  latitude: number;
  longitude: number;
  description?: string;
  createdAt: string;
}

export interface NearbyIncidents {
  count: number;
  incidents: Incident[];
}
