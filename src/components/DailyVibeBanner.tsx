import { useState, type FormEvent } from 'react'
import { VIBE_PRESETS, type CandidateCardDto, type VibeCategory } from '../types/vibe.ts'
import { vibeApi } from '../api/index.ts'

interface DailyVibeBannerProps {
  myProfile: CandidateCardDto | null
  selectedCategoryFilter: VibeCategory | null
  onSelectCategoryFilter: (cat: VibeCategory | null) => void
  onProfileUpdated: (updated: CandidateCardDto) => void
}

export function DailyVibeBanner({
  myProfile,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  onProfileUpdated,
}: DailyVibeBannerProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [category, setCategory] = useState<VibeCategory>(
    myProfile?.activeVibeCategory ?? 'Coffee',
  )
  const [title, setTitle] = useState(
    myProfile?.activeVibeTitle ?? VIBE_PRESETS[0].defaultTitle,
  )
  const [locationHint, setLocationHint] = useState(
    myProfile?.activeVibeLocationHint ?? VIBE_PRESETS[0].defaultLocation,
  )
  const [durationMinutes, setDurationMinutes] = useState(180)
  const [busy, setBusy] = useState(false)

  const handlePresetClick = (presetCategory: VibeCategory) => {
    const preset = VIBE_PRESETS.find((p) => p.category === presetCategory)
    setCategory(presetCategory)
    if (preset) {
      setTitle(preset.defaultTitle)
      setLocationHint(preset.defaultLocation)
    }
  }

  const handleSaveVibe = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const updated = await vibeApi.setDailyVibe({
        category,
        title,
        locationHint,
        durationMinutes,
      })
      onProfileUpdated(updated)
      onSelectCategoryFilter(category)
      setIsEditorOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="hero-vibe-section">
      <div className="hero-vibe-header">
        <div>
          <p className="hero-caption">СИТУАЦИОННЫЙ МЭТЧИНГ • VIBE & ACTIVITY MATCH</p>
          <h1>Настрой свой «Вайб дня» и найди пару на вечер</h1>
          <p className="hero-sub">
            Выбери спонтанный план с таймером актуальности — декларативный движок правил (Specification
            Pattern) мгновенно перестроит ленту и отранжирует кандидатов с похожим окном времени.
          </p>
        </div>

        <div className="my-vibe-status-card">
          <span className="status-card-label">Твой текущий статус:</span>
          {myProfile?.activeVibeCategory && myProfile.remainingVibeMinutes ? (
            <>
              <div className="status-card-title">
                {VIBE_PRESETS.find((p) => p.category === myProfile.activeVibeCategory)?.emoji}{' '}
                {myProfile.activeVibeTitle}
              </div>
              <div className="status-card-meta">
                📍 {myProfile.activeVibeLocationHint} • ⏳ ещё {myProfile.remainingVibeMinutes} мин
              </div>
            </>
          ) : (
            <div className="status-card-empty">Статус не задан — включи вайб на вечер!</div>
          )}
          <button
            type="button"
            className="primary-button small"
            onClick={() => setIsEditorOpen((prev) => !prev)}
          >
            {isEditorOpen ? 'Скрыть редактор' : '⚡ Изменить мой Вайб дня'}
          </button>
        </div>
      </div>

      {/* Быстрые чипсы-пресеты фильтрации ленты по категории Вайба */}
      <div className="vibe-chips-bar">
        <button
          type="button"
          className={`vibe-chip ${selectedCategoryFilter === null ? 'active' : ''}`}
          onClick={() => onSelectCategoryFilter(null)}
        >
          ✨ Все категории вайба
        </button>
        {VIBE_PRESETS.map((preset) => (
          <button
            key={preset.category}
            type="button"
            className={`vibe-chip ${selectedCategoryFilter === preset.category ? 'active' : ''}`}
            onClick={() => onSelectCategoryFilter(preset.category)}
          >
            <span>{preset.emoji}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {isEditorOpen ? (
        <form className="vibe-editor-modal" onSubmit={handleSaveVibe}>
          <h3>Выставить «Вайб дня» с таймером</h3>
          <div className="vibe-preset-selector">
            {VIBE_PRESETS.map((preset) => (
              <button
                key={preset.category}
                type="button"
                className={`vibe-preset-btn ${category === preset.category ? 'selected' : ''}`}
                onClick={() => handlePresetClick(preset.category)}
              >
                {preset.emoji} {preset.label}
              </button>
            ))}
          </div>

          <div className="form-grid-3">
            <label className="field-block">
              <span>План / идея встречи</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Например: Выпить фильтр-кофе до 19:00"
              />
            </label>
            <label className="field-block">
              <span>Локация / район</span>
              <input
                type="text"
                value={locationHint}
                onChange={(e) => setLocationHint(e.target.value)}
                required
                placeholder="Патриаршие / Китай-город"
              />
            </label>
            <label className="field-block">
              <span>Таймер актуальности</span>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                <option value={90}>На 1.5 часа</option>
                <option value={180}>На 3 часа (до вечера)</option>
                <option value={300}>На 5 часов</option>
              </select>
            </label>
          </div>

          <div className="detail-actions">
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? 'Сохранение…' : '🚀 Активировать Вайб и перестроить ленту'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
