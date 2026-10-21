import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { VIBE_PRESETS } from '../types/vibe.ts'

export function Navbar() {
  const { isAuthenticated, user, myProfile, logout } = useAuth()

  const activePreset = VIBE_PRESETS.find((p) => p.category === myProfile?.activeVibeCategory)

  return (
    <header className="topbar">
      <div className="topbar-left">
        <NavLink to="/" className="brand">
          <span className="brand-dot">✦</span> VibeMatch
        </NavLink>
        {activePreset && myProfile?.remainingVibeMinutes ? (
          <span className="active-vibe-pill" title={myProfile.activeVibeTitle ?? ''}>
            {activePreset.emoji} {activePreset.label} • ещё {myProfile.remainingVibeMinutes} мин
          </span>
        ) : null}
      </div>

      {isAuthenticated ? (
        <nav className="topbar-menu" aria-label="Основная навигация">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `service-link ${isActive ? 'active' : ''}`}
          >
            🔥 Лента и Вайб дня
          </NavLink>
          <NavLink
            to="/matches"
            className={({ isActive }) => `service-link ${isActive ? 'active' : ''}`}
          >
            💬 Мэтчи и Чат
          </NavLink>
          <NavLink
            to="/engine"
            className={({ isActive }) => `service-link ${isActive ? 'active' : ''}`}
          >
            ⚙️ Декларативное ядро (AST)
          </NavLink>
        </nav>
      ) : null}

      <div className="topbar-actions">
        {isAuthenticated ? (
          <>
            <span className="user-chip">👤 {user?.displayName}</span>
            <button type="button" className="ghost-button small" onClick={logout}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="ghost-button">
              Войти
            </NavLink>
            <NavLink to="/register" className="primary-outline-button">
              Регистрация
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}
