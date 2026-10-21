import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { ApiError } from '../api/index.ts'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@vibematch.ru')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Неверный email или пароль.')
      } else {
        setError('Сервер недоступен. Убедитесь, что запущен VibeMatch.Api (порт 5080).')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page-shell auth-container">
      <header className="page-header">
        <span className="stub-badge">VIBEMATCH • СИТУАЦИОННЫЙ ДЕЙТИНГ</span>
        <h1 className="page-title">Вход в аккаунт</h1>
        <p className="page-lead">
          Для демонстрации уже предзаполнен тестовый профиль Алексея (<code>demo@vibematch.ru</code>{' '}
          / <code>demo123</code>), у которого есть входящие лайки по «Вайбу дня».
        </p>
      </header>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-block">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="field-block">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="primary-button wide" disabled={busy}>
          {busy ? 'Вход…' : '🚀 Войти в VibeMatch'}
        </button>
        <p className="helper-text">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </section>
  )
}
