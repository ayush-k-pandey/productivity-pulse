
export interface User {
  name: string;
  email: string;
  selectedActivityIds: string[];
  themeColor: string;
  isDarkMode: boolean;
  activeWidgets: string[];
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  morningReminder: boolean;
  eveningSummary: boolean;
  reminderTime: string; // HH:mm
}

export type Priority = 'low' | 'medium' | 'high';
export type Recurrence = 'none' | 'daily' | 'weekly';

export interface Note {
  id: string;
  title: string;
  text: string;
  dueTime: string; // ISO string
  priority: Priority;
  recurring: Recurrence;
  completed: boolean;
  notified: boolean;
  createdAt: number;
}

export interface Account {
  name: string;
  email: string;
  lastLogin: number;
}

export type CategoryType = 'Physical' | 'Study' | 'Skills' | 'Health' | 'Fun';

export interface Activity {
  id: string;
  name: string;
  category: CategoryType;
  icon: string;
}

export interface DayProgress {
  [activityId: string]: boolean;
}

export interface HistoryData {
  [date: string]: DayProgress;
}

export interface UserDataPayload {
  user: User;
  history: HistoryData;
  notes: Note[];
}

export type ViewState = 'splash' | 'auth' | 'personalization' | 'dashboard' | 'analytics' | 'advanced';
