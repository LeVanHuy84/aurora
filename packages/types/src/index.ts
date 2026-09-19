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

export enum MessageType {
  TEXT = 'TEXT',
  MOMENT_REPLY = 'MOMENT_REPLY',
  REACTION_BURST = 'REACTION_BURST',
}

export enum MediaFolder {
  MOMENTS = 'moments',
  AVATARS = 'avatars',
}

export interface PresignedSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
  publicId?: string;
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
  messagesCount?: number;
  commentsCount?: number;
  _count?: {
    reactions?: number;
    messages?: number;
    comments?: number;
  };
  hasReacted?: boolean;
  userReactionType?: ReactionType | string | null;
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

// ------------------------------------------------------
// CHAT & INTERACTIONS TYPES
// ------------------------------------------------------

export interface QuotedMomentSummary {
  id: string;
  type: MomentType;
  content?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  userId: string;
  emotion?: EmotionItem | null;
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  momentId?: string | null;
  moment?: QuotedMomentSummary | null;
  sender?: UserProfile | FriendUser;
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationMemberItem {
  id: string;
  userId: string;
  lastReadAt?: string | null;
  joinedAt: string;
  user: UserProfile | FriendUser;
}

export interface ConversationItem {
  id: string;
  isGroup: boolean;
  name?: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  friend?: FriendUser | UserProfile;
  lastMessage?: ChatMessageItem | null;
  unreadCount?: number;
  members?: ConversationMemberItem[];
}

export interface SendMessagePayload {
  content: string;
  momentId?: string;
  type?: MessageType;
}

export interface ReactionItem {
  id: string;
  momentId: string;
  userId: string;
  type: ReactionType | string;
  createdAt: string;
  user: FriendUser | UserProfile;
}

export interface MomentInteractionThread {
  friend: FriendUser | UserProfile;
  conversationId: string;
  lastMessage?: ChatMessageItem | null;
  messages: ChatMessageItem[];
}

export interface MomentInteractionsResponse {
  momentId: string;
  isOwner: boolean;
  reactions: ReactionItem[];
  threads: MomentInteractionThread[];
  myReaction?: ReactionItem | null;
}
