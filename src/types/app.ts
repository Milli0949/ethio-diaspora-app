export type Lang = 'am' | 'en';
export type Theme = 'dark' | 'light';
export type MessagePrivacy = 'all' | 'friends' | 'none';

export type MainScreen =
  | 'login'
  | 'register'
  | 'main'
  | 'detail'
  | 'matches'
  | 'search'
  | 'chat'
  | 'notifications'
  | 'private-gate'
  | 'settings';

export type PrivateScreen =
  | 'p-main'
  | 'p-search'
  | 'p-chat'
  | 'p-notifications'
  | 'p-settings';

export interface UserProfile {
  name: string;
  age: number;
  phone: string;
  gender: 'male' | 'female';
  city: string;
  job: string;
  religion: string;
  goal: string;
  hobbies: string;
  bio: string;
  photos: (string | null)[];
  selfieVerified: boolean;
  locationVerified: boolean;
  verifiedCity?: string;
  password?: string;
}

export interface PersonProfile {
  id: number;
  name: string;
  age: number;
  city: string;
  phone: string;
  job: string;
  gender: 'male' | 'female';
  religion: string;
  goal: 'marriage' | 'serious' | 'friendship';
  hobbies: string;
  bio: string;
  isFriend: boolean;
  likedByThem: boolean;
  likedByMe: boolean;
  online: boolean;
  color: string;
  photoCaptions: string[];
}

export interface MediaAttachment {
  name: string;
  url: string;
  type: string;
}

export interface PostComment {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface PostItem {
  id: number;
  author: string;
  authorId?: number;
  text: string;
  likes: number;
  likedByMe?: boolean;
  comments: PostComment[];
  visibility: 'all' | 'friends';
  media: MediaAttachment | null;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  from: 'in' | 'out';
  text: string;
  replyTo?: string;
  file?: MediaAttachment;
  status?: 'sent' | 'seen';
  time: string;
}

export interface AppNotification {
  id: number;
  type: 'match' | 'friend_request' | 'like' | 'comment';
  personId?: number;
  personName: string;
  avatarColor: string;
  messageAm: string;
  messageEn: string;
  time: string;
  read: boolean;
  handled?: 'accepted' | 'declined';
}

export interface PrivateUser {
  id: string;
  alias: string;
  city: string;
  bioAm: string;
  bioEn: string;
  online: boolean;
  color: string;
}

export interface PrivatePost {
  id: number;
  author: string;
  text: string;
  likes: number;
  likedByMe?: boolean;
  media?: MediaAttachment | null;
  comments: { id: number; author: string; text: string }[];
  time: string;
}

export interface PrivateNotification {
  id: number;
  alias: string;
  textAm: string;
  textEn: string;
  time: string;
  read: boolean;
}

export interface PrivateAccountConfig {
  alias: string;
  pin: string;
  disappearing: boolean;
}
