import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { useDeclarativeMatchFeed } from '../hooks/useDeclarativeMatchFeed.ts'
import { DailyVibeBanner } from '../components/DailyVibeBanner.tsx'
import { CandidateCard } from '../components/CandidateCard.tsx'

export function DiscoveryFeedPage() {
  const { myProfile, setMyProfile } = useAuth()
  const navigate = useNavigate()

  const {
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
  } = useDeclarativeMatchFeed(null)

  return (
    <div className="discovery-page">
      <DailyVibeBanner
        myProfile={myProfile}
        selectedCategoryFilter={filter.targetVibeCategory}
        onSelectCategoryFilter={selectVibeCategoryFilter}
        onProfileUpdated={setMyProfile}
      />

      {/* Живая витрина скомпилированной спецификации (AST -> SQL) */}
      <section className="ast-live-inspector">
        <div className="ast-inspector-header">
          <div>
            <span className="ast-badge">DECLARATIVE SPECIFICATION ENGINE (LINQ-TO-SQL AST)</span>
            <h3 className="ast-rule-title">{feedData.composedSpecificationRule}</h3>
          </div>
          <span className="ast-count-pill">
            Найдено анкет в БД: <strong>{feedData.totalMatchedCount}</strong>
          </span>
        </div>

        <div className="active-rule-chain">
          {activeRuleBadges.map((badge, index) => (
            <span key={badge.id} className="rule-chain-item">
              {index > 0 ? <strong className="rule-op">{badge.operator}</strong> : null}
              <span className="rule-pill">{badge.label}</span>
            </span>
          ))}
        </div>

        <details className="ast-expression-details">
          <summary>Показать сгенерированное дерево выражений C# Expression&lt;Func&lt;UserAccount, bool&gt;&gt;</summary>
          <pre className="ast-code-preview">{feedData.expressionTreePreview}</pre>
        </details>
      </section>

      <div className="results-layout">
        {/* Боковая панель декларативных правил композиции (.And / .Or) */}
        <aside className="results-filters">
          <h3 className="filters-title">Конструктор правил</h3>

          <label className="filter-block">
            <span>Мин. возраст: {filter.minAge} лет</span>
            <input
              type="range"
              min={18}
              max={35}
              value={filter.minAge}
              onChange={(e) =>
                updateFilterRule({
                  minAge: Math.min(Number(e.target.value), filter.maxAge),
                })
              }
            />
          </label>

          <label className="filter-block">
            <span>Макс. возраст: {filter.maxAge} лет</span>
            <input
              type="range"
              min={19}
              max={45}
              value={filter.maxAge}
              onChange={(e) =>
                updateFilterRule({
                  maxAge: Math.max(Number(e.target.value), filter.minAge),
                })
              }
            />
          </label>

          <label className="filter-block">
            <span>Гео-радиус (Bounding Box): {filter.maxDistanceKm} км</span>
            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={filter.maxDistanceKm}
              onChange={(e) => updateFilterRule({ maxDistanceKm: Number(e.target.value) })}
            />
          </label>

          <label className="filter-block">
            <span>Окно пересечения таймера: ≥ {filter.minTimeOverlapMinutes} мин</span>
            <select
              value={filter.minTimeOverlapMinutes}
              onChange={(e) =>
                updateFilterRule({ minTimeOverlapMinutes: Number(e.target.value) })
              }
            >
              <option value={15}>Минимум 15 минут</option>
              <option value={30}>Минимум 30 минут</option>
              <option value={60}>Минимум 1 час</option>
              <option value={120}>Минимум 2 часа</option>
            </select>
          </label>

          <label className="checkbox-row filter-check">
            <input
              type="checkbox"
              checked={filter.requireActiveVibe}
              onChange={(e) => updateFilterRule({ requireActiveVibe: e.target.checked })}
            />
            <span>Только с активным таймером «Вайба дня» (.And)</span>
          </label>

          <label className="checkbox-row filter-check">
            <input
              type="checkbox"
              checked={filter.includeRelaxedVibeFallback}
              disabled={!filter.targetVibeCategory}
              onChange={(e) =>
                updateFilterRule({ includeRelaxedVibeFallback: e.target.checked })
              }
            />
            <span>Мягкая композиция категории через оператор .Or()</span>
          </label>

          <hr className="filter-divider" />

          <button
            type="button"
            className="secondary-button wide"
            onClick={() => void resetSwipesAndReload()}
          >
            🔄 Сбросить просмотренные анкеты
          </button>
        </aside>

        {/* Сетка отранжированных карточек */}
        <main className="results-main">
          {loading ? (
            <div className="page-shell">Вычисление спецификаций и ранжирование анкет…</div>
          ) : feedData.candidates.length === 0 ? (
            <div className="page-shell empty-feed-box">
              <h2>Подходящих анкет по текущему правилу не осталось</h2>
              <p className="page-lead">
                Попробуй выбрать другую категорию «Вайба дня», переключить оператор композиции на{' '}
                <code>.Or()</code> или сбросить историю демо-свайпов.
              </p>
              <div className="detail-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void resetSwipesAndReload()}
                >
                  🔄 Восстановить демо-анкеты
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => selectVibeCategoryFilter(null)}
                >
                  Показать все категории Вайба
                </button>
              </div>
            </div>
          ) : (
            <div className="candidates-grid">
              {feedData.candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onSwipe={swipeCandidate}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Модальное окно взаимного ситуационного мэтча */}
      {lastMatchModal ? (
        <div className="match-modal-backdrop" role="dialog" aria-modal="true">
          <div className="match-modal-card">
            <span className="match-sparkle">🎉 ВЗАИМНЫЙ ВАЙБ-МЭТЧ!</span>
            <h2>Вы совпали с {lastMatchModal.partnerName}!</h2>
            <p className="match-context-pill">{lastMatchModal.matchedActivityContext}</p>
            <p className="match-score-line">
              Индекс декларативной совместимости:{' '}
              <strong>{lastMatchModal.compatibilityScore}%</strong>
            </p>
            <div className="detail-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setLastMatchModal(null)
                  navigate(`/matches?pairId=${lastMatchModal.matchPairId}`)
                }}
              >
                💬 Перейти в чат с контекстом Вайба
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setLastMatchModal(null)}
              >
                Продолжить просмотр
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
