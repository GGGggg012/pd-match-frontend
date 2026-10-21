import { useState } from 'react'
import { VIBE_PRESETS, type CandidateCardDto } from '../types/vibe.ts'

interface CandidateCardProps {
  candidate: CandidateCardDto
  onSwipe: (candidate: CandidateCardDto, isLike: boolean) => Promise<unknown>
}

export function CandidateCard({ candidate, onSwipe }: CandidateCardProps) {
  const [showFormula, setShowFormula] = useState(false)
  const [swiping, setSwiping] = useState(false)

  const vibePreset = VIBE_PRESETS.find((p) => p.category === candidate.activeVibeCategory)

  const handleAction = async (isLike: boolean) => {
    setSwiping(true)
    try {
      await onSwipe(candidate, isLike)
    } finally {
      setSwiping(false)
    }
  }

  return (
    <article className="candidate-card">
      <div className="candidate-photo-wrap">
        <img
          src={candidate.avatarUrl}
          alt={candidate.firstName}
          className="candidate-photo"
          loading="lazy"
        />
        <div className="compatibility-badge" title="Итоговый балл декларативного пайплайна">
          ⚡ {candidate.compatibilityScore}% совпадение
        </div>
        <div className="distance-pill">
          📍 {candidate.distanceKm} км • {candidate.district}
        </div>
      </div>

      <div className="candidate-body">
        <div className="candidate-title-row">
          <h2>
            {candidate.firstName}, {candidate.age}
          </h2>
          <span className="candidate-handle">@{candidate.username}</span>
        </div>

        {candidate.activeVibeCategory && candidate.activeVibeTitle ? (
          <div className="candidate-vibe-box">
            <div className="vibe-box-top">
              <span className="vibe-tag">
                {vibePreset?.emoji ?? '✨'} {vibePreset?.label ?? candidate.activeVibeCategory}
              </span>
              {candidate.remainingVibeMinutes ? (
                <span className="vibe-timer">⏳ ещё {candidate.remainingVibeMinutes} мин</span>
              ) : null}
            </div>
            <p className="vibe-box-plan">«{candidate.activeVibeTitle}»</p>
            {candidate.activeVibeLocationHint ? (
              <p className="vibe-box-loc">Ориентир: {candidate.activeVibeLocationHint}</p>
            ) : null}
          </div>
        ) : null}

        <p className="candidate-bio">{candidate.bio}</p>

        <div className="interests-wrap">
          {candidate.interests.map((tag) => {
            const isShared = candidate.sharedInterests.some(
              (s) => s.toLowerCase() === tag.toLowerCase(),
            )
            return (
              <span key={tag} className={`interest-chip ${isShared ? 'shared' : ''}`}>
                {isShared ? '✓ ' : ''}
                {tag}
              </span>
            )
          })}
        </div>

        <button
          type="button"
          className="formula-toggle-btn"
          onClick={() => setShowFormula((prev) => !prev)}
        >
          {showFormula
            ? '▲ Скрыть декларативный расчёт скоринга'
            : '📊 Показать декомпозицию скоринга (LINQ Pipeline)'}
        </button>

        {showFormula ? (
          <div className="score-breakdown-panel">
            {candidate.scoreBreakdown.map((item) => (
              <div key={item.criterionName} className="breakdown-row">
                <div className="breakdown-head">
                  <strong>{item.criterionName}</strong>
                  <span>
                    +{item.weightedPoints} / {item.weight} б.
                  </span>
                </div>
                <div className="breakdown-reason">{item.explanation}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="candidate-actions">
          <button
            type="button"
            className="pass-btn"
            disabled={swiping}
            onClick={() => void handleAction(false)}
          >
            ✕ Пропустить
          </button>
          <button
            type="button"
            className="like-btn"
            disabled={swiping}
            onClick={() => void handleAction(true)}
          >
            ❤️ Откликнуться на Вайб
          </button>
        </div>
      </div>
    </article>
  )
}
