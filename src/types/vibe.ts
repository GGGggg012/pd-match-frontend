export type VibeCategory =
  | 'Coffee'
  | 'Exhibition'
  | 'BoardGames'
  | 'CityWalk'
  | 'Cinema'
  | 'Coworking'
  | 'Sport'
  | 'MusicAndBar'

export type Gender = 'Male' | 'Female' | 'Other'
export type GenderPreference = 'Any' | 'Male' | 'Female'

export interface RuleScoreBreakdown {
  criterionName: string
  rawScore: number
  weight: number
  weightedPoints: number
  explanation: string
}

export interface CandidateCardDto {
  id: number
  firstName: string
  username: string
  age: number
  gender: Gender
  bio: string
  city: string
  district: string
  avatarUrl: string
  interests: string[]
  activeVibeCategory: VibeCategory | null
  activeVibeTitle: string | null
  activeVibeLocationHint: string | null
  activeVibeExpiresAtUtc: string | null
  remainingVibeMinutes: number | null
  distanceKm: number
  compatibilityScore: number
  sharedInterests: string[]
  scoreBreakdown: RuleScoreBreakdown[]
}

export interface DeclarativeFeedFilterDto {
  minAge: number
  maxAge: number
  maxDistanceKm: number
  requireActiveVibe: boolean
  targetVibeCategory: VibeCategory | null
  minTimeOverlapMinutes: number
  includeRelaxedVibeFallback: boolean
}

export interface DeclarativeFeedResponseDto {
  composedSpecificationRule: string
  expressionTreePreview: string
  totalMatchedCount: number
  candidates: CandidateCardDto[]
}

export interface SetDailyVibeDto {
  category: VibeCategory
  title: string
  locationHint: string
  durationMinutes: number
}

export interface SwipeResultDto {
  isMutualMatch: boolean
  matchPairId: number | null
  matchedActivityContext: string | null
  compatibilityScore: number | null
  partnerName: string | null
  partnerAvatarUrl: string | null
}

export interface MatchPairSummaryDto {
  matchPairId: number
  partnerId: number
  partnerName: string
  partnerAge: number
  partnerAvatarUrl: string
  partnerDistrict: string
  matchedVibeCategory: VibeCategory | null
  matchedActivityContext: string
  compatibilityScore: number
  createdAtUtc: string
  lastMessagePreview: string | null
}

export interface ChatMessageDto {
  id: number
  matchPairId: number
  senderId: number
  senderName: string
  text: string
  isSystemContextBanner: boolean
  sentAtUtc: string
}

export interface VibePresetMeta {
  category: VibeCategory
  label: string
  emoji: string
  defaultTitle: string
  defaultLocation: string
  accentColor: string
}

export const VIBE_PRESETS: readonly VibePresetMeta[] = [
  {
    category: 'Coffee',
    label: 'Кофе в центре',
    emoji: '☕',
    defaultTitle: 'Выпить фильтр-кофе в центре до 19:00',
    defaultLocation: 'Патриаршие / Покровка',
    accentColor: '#d97706',
  },
  {
    category: 'Exhibition',
    label: 'Выставка и арт',
    emoji: '🎨',
    defaultTitle: 'Сходить на выставку сегодня вечером',
    defaultLocation: 'ГЭС-2 / ММОМА',
    accentColor: '#7c3aed',
  },
  {
    category: 'BoardGames',
    label: 'Настолки',
    emoji: '🎲',
    defaultTitle: 'Поиграть в настолки и выпить сидр',
    defaultLocation: 'Чистые пруды',
    accentColor: '#059669',
  },
  {
    category: 'CityWalk',
    label: 'Вечерняя прогулка',
    emoji: '🌆',
    defaultTitle: 'Прогуляться по набережной на закате',
    defaultLocation: 'Парк Горького / Нескучный сад',
    accentColor: '#2563eb',
  },
  {
    category: 'Coworking',
    label: 'Коворкинг',
    emoji: '💻',
    defaultTitle: 'Поработать в кофейне за ноутбуками 2 часа',
    defaultLocation: 'Белорусская / Депо',
    accentColor: '#0f766e',
  },
  {
    category: 'MusicAndBar',
    label: 'Винил и бар',
    emoji: '🎷',
    defaultTitle: 'Послушать виниловый сет вечером',
    defaultLocation: 'Китай-город / Винзавод',
    accentColor: '#db2777',
  },
] as const
