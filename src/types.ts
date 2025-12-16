export interface PinSuggestion {
  id: string;
  title: string;
  description: string;
  altText: string;
  tags: string[];
  imagePrompt: string;
  generatedImageBase64?: string;
  scheduleDate?: string; // ISO Date string
  status: 'draft' | 'scheduled' | 'published';
  destinationLink?: string;
  boardName?: string;
}

export interface BlogPostInput {
  title: string;
  summary: string;
  url: string;
  boardName: string;
}

export interface ScheduleItem {
  date: string;
  pinId: string;
}

export interface PinterestUser {
  username: string;
  avatarUrl: string;
  boards: string[];
  autoPublish: boolean;
  accessToken?: string; // New: Pinterest API Token
  boardId?: string;     // New: Default Board ID
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  SCHEDULE = 'SCHEDULE',
  SETTINGS = 'SETTINGS',
  PRIVACY = 'PRIVACY'
}