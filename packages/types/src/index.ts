export enum MomentType {
  PHOTO = 'PHOTO',
  NOTE = 'NOTE',
  MOOD = 'MOOD',
}

export enum Visibility {
  ONLY_ME = 'ONLY_ME',
  FRIENDS = 'FRIENDS',
  CLOSE_FRIENDS = 'CLOSE_FRIENDS',
}

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BLOCKED = 'BLOCKED',
}

export enum ReactionType {
  LOVE = 'LOVE',
  CARE = 'CARE',
  FUNNY = 'FUNNY',
  RELATABLE = 'RELATABLE',
  PROUD = 'PROUD',
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
}

export interface FriendUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface FriendshipItem {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  isCloseFriend: boolean;
  createdAt: string;
  friend: FriendUser;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface OAuthPayload {
  idToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface EmotionItem {
  id: string;
  code: string;
  label: string;
  icon: string;
  color?: string | null;
  order: number;
}

export interface MomentItem {
  id: string;
  userId: string;
  type: MomentType;
  content?: string | null;
  imageUrl?: string | null;
  emotionId?: string | null;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  user?: UserProfile;
  emotion?: EmotionItem | null;
  reactionsCount?: number;
  commentsCount?: number;
  _count?: {
    reactions?: number;
    comments?: number;
  };
  hasReacted?: boolean;
}

export interface CreateMomentPayload {
  type: MomentType;
  content?: string;
  imageUrl?: string;
  emotionId?: string;
  visibility?: Visibility;
}

export interface CalendarMomentItem {
  id: string;
  type: MomentType;
  createdAt: string;
  emotion?: EmotionItem | null;
}

export interface HistoryMeta {
  hasMore: boolean;
  nextCursor: string | null;
  limit: number;
}

export interface HistoryResponse {
  items: MomentItem[];
  meta: HistoryMeta;
}

