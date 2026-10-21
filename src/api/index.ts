import { apiClient, AUTH_EXPIRED_EVENT, getAuthToken, setAuthToken } from './client.ts'
import { ApiError } from './errors.ts'
import type {
  CandidateCardDto,
  ChatMessageDto,
  DeclarativeFeedFilterDto,
  DeclarativeFeedResponseDto,
  Gender,
  GenderPreference,
  MatchPairSummaryDto,
  SetDailyVibeDto,
  SwipeResultDto,
} from '../types/vibe.ts'

export { apiClient, AUTH_EXPIRED_EVENT, getAuthToken, setAuthToken, ApiError }

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  username: string
  email: string
  password: string
  phone: string
  age?: number
  gender?: Gender
  preferredGender?: GenderPreference
  bio?: string
  district?: string
  interestsCsv?: string
}

export interface LoginResultDto {
  userId: number
  username: string
  firstName: string
  role: string
  token: string
}

export const vibeApi = {
  login: (body: LoginRequest) =>
    apiClient.request<LoginResultDto, LoginRequest>('/api/auth/login', {
      method: 'POST',
      body,
    }),

  register: (body: RegisterRequest) =>
    apiClient.request<LoginResultDto, RegisterRequest>('/api/auth/register', {
      method: 'POST',
      body,
    }),

  getMyProfile: () => apiClient.request<CandidateCardDto>('/api/auth/me'),

  setDailyVibe: (body: SetDailyVibeDto) =>
    apiClient.request<CandidateCardDto, SetDailyVibeDto>('/api/auth/vibe', {
      method: 'PUT',
      body,
    }),

  clearDailyVibe: () =>
    apiClient.request<CandidateCardDto>('/api/auth/vibe', {
      method: 'DELETE',
    }),

  getDeclarativeFeed: (filter: DeclarativeFeedFilterDto) =>
    apiClient.request<DeclarativeFeedResponseDto, DeclarativeFeedFilterDto>('/api/matching/feed', {
      method: 'POST',
      body: filter,
    }),

  swipeCandidate: (targetUserId: number, isLike: boolean) =>
    apiClient.request<SwipeResultDto, { targetUserId: number; isLike: boolean }>(
      '/api/matching/swipe',
      {
        method: 'POST',
        body: { targetUserId, isLike },
      },
    ),

  resetDemoSwipes: () =>
    apiClient.request<{ message: string }>('/api/matching/reset-demo-swipes', {
      method: 'POST',
    }),

  getMyMatches: () => apiClient.request<MatchPairSummaryDto[]>('/api/chat/matches'),

  getMessages: (matchPairId: number) =>
    apiClient.request<ChatMessageDto[]>(`/api/chat/matches/${matchPairId}/messages`),

  sendMessage: (matchPairId: number, text: string) =>
    apiClient.request<ChatMessageDto, { text: string }>(
      `/api/chat/matches/${matchPairId}/messages`,
      {
        method: 'POST',
        body: { text },
      },
    ),
}
