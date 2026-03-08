export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  plan: 'Free' | 'Pro' | 'Premium';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  type: 'summary' | 'notes' | 'flashcards' | 'proofread' | 'translation';
  date: number;
  preview: string;
  status: 'completed' | 'processing' | 'failed';
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  SAVED = 'SAVED',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT'
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR'
}

export interface Settings {
  bio: string;
  phone: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  privacy: boolean;
  marketing: boolean;
  summaryLength: 'Short' | 'Medium' | 'Long';
  noteStyle: 'Bullet Points' | 'Outline' | 'Cornell';
}