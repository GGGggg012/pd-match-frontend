import { useCallback, useEffect, useMemo, useState } from 'react'
import { vibeApi } from '../api/index.ts'
import {
  VIBE_PRESETS,
  type CandidateCardDto,
  type DeclarativeFeedFilterDto,
  type DeclarativeFeedResponseDto,
  type SwipeResultDto,
  type VibeCategory,
} from '../types/vibe.ts'

/**
 * Чистый декларативный хук управления правилами фильтрации и лентой кандидатов.
 * Реактивно перестраивает запрос к движку Specification Pattern при любом изменении
 * выбранного «Вайба дня» или параметров композиции правил.
 */
export function useDeclarativeMatchFeed(initialVibeCategory: VibeCategory | null = null) {
  const [filter, setFilter] = useState<DeclarativeFeedFilterDto>(() => ({
    minAge: 18,
    maxAge: 32,
    maxDistanceKm: 15,
    requireActiveVibe: true,
    targetVibeCategory: initialVibeCategory,
    minTimeOverlapMinutes: 30,
    includeRelaxedVibeFallback: false,
  }))

  const [feedData, setFeedData] = useState<DeclarativeFeedResponseDto>({
    composedSpecificationRule: 'Identity(True)',
    expressionTreePreview: 'candidate => true',
    totalMatchedCount: 0,
    candidates: [],
  })
  const [loading, setLoading] = useState(false)
  const [lastMatchModal, setLastMatchModal] = useState<SwipeResultDto | null>(null)

  const reloadFeed = useCallback(async (activeFilter: DeclarativeFeedFilterDto) => {
    setLoading(true)
    try {
      const response = await vibeApi.getDeclarativeFeed(activeFilter)
      setFeedData(response)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reloadFeed(filter)
  }, [filter, reloadFeed])

  const updateFilterRule = useCallback((patch: Partial<DeclarativeFeedFilterDto>) => {
    setFilter((prev) => ({ ...prev, ...patch }))
  }, [])

  const selectVibeCategoryFilter = useCallback((category: VibeCategory | null) => {
    setFilter((prev) => ({
      ...prev,
      targetVibeCategory: prev.targetVibeCategory === category ? null : category,
      requireActiveVibe: category !== null ? true : prev.requireActiveVibe,
    }))
  }, [])

  const swipeCandidate = useCallback(
    async (candidate: CandidateCardDto, isLike: boolean) => {
      const result = await vibeApi.swipeCandidate(candidate.id, isLike)
      setFeedData((prev) => ({
        ...prev,
        totalMatchedCount: Math.max(0, prev.totalMatchedCount - 1),
        candidates: prev.candidates.filter((item) => item.id !== candidate.id),
      }))
      if (result.isMutualMatch) {
        setLastMatchModal(result)
      }
      return result
    },
    [],
  )

  const resetSwipesAndReload = useCallback(async () => {
    await vibeApi.resetDemoSwipes()
    await reloadFeed(filter)
  }, [filter, reloadFeed])

  // Декларативная сводка активных предикатов для визуализации в UI
  const activeRuleBadges = useMemo(
    () =>
      [
        {
          id: 'age',
          label: `Возраст: ${filter.minAge}–${filter.maxAge} лет`,
          operator: 'AND',
          active: true,
        },
        {
          id: 'geo',
          label: `Радиус: ≤ ${filter.maxDistanceKm} км`,
          operator: 'AND',
          active: true,
        },
        {
          id: 'activeVibe',
          label: `Активный таймер Вайба (≥ ${filter.minTimeOverlapMinutes} мин)`,
          operator: 'AND',
          active: filter.requireActiveVibe,
        },
        {
          id: 'vibeCategory',
          label: filter.targetVibeCategory
            ? `Категория: ${VIBE_PRESETS.find((p) => p.category === filter.targetVibeCategory)?.label ?? filter.targetVibeCategory}`
            : 'Любая категория Вайба',
          operator: filter.includeRelaxedVibeFallback ? 'OR' : 'AND',
          active: filter.targetVibeCategory !== null,
        },
      ].filter((badge) => badge.active),
    [filter],
  )

  return {
    filter,
    feedData,
    loading,
    activeRuleBadges,
    lastMatchModal,
    setLastMatchModal,
    updateFilterRule,
    selectVibeCategoryFilter,
    swipeCandidate,
    resetSwipesAndReload,
  }
}
