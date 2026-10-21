import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import type { Gender, GenderPreference } from '../types/vibe.ts'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const firstName = String(fd.get('firstName') ?? '').trim()
    const username = String(fd.get('username') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const age = Number(fd.get('age') ?? 23)
    const gender = (fd.get('gender') as Gender) ?? 'Male'
    const preferredGender = (fd.get('preferredGender') as GenderPreference) ?? 'Any'
    const district = String(fd.get('district') ?? 'Центр').trim()
    const interestsCsv = String(fd.get('interestsCsv') ?? '').trim()
    const bio = String(fd.get('bio') ?? '').trim()

    setBusy(true)
    try {
      await register({
        firstName,
        username,
        email,
        password,
        phone: '',
        age,
        gender,
        preferredGender,
        district,
        interestsCsv,
        bio,
      })
      navigate('/', { replace: true })
    } catch {
      setError('Не удалось создать профиль. Возможно, этот Email уже занят.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page-shell auth-container">
      <header className="page-header">
        <h1 className="page-title">Создание анкеты VibeMatch</h1>
        <p className="page-lead">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </header>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <label className="field-block">
            <span>Имя</span>
            <input name="firstName" type="text" required placeholder="Максим" />
          </label>
          <label className="field-block">
            <span>Никнейм</span>
            <input name="username" type="text" required placeholder="max_vibe" />
          </label>
        </div>

        <div className="form-grid-2">
          <label className="field-block">
            <span>Email</span>
            <input name="email" type="email" required placeholder="you@vibematch.ru" />
          </label>
          <label className="field-block">
            <span>Пароль</span>
            <input name="password" type="password" minLength={6} required />
          </label>
        </div>

        <div className="form-grid-3">
          <label className="field-block">
            <span>Возраст</span>
            <input name="age" type="number" min={18} max={70} defaultValue={23} required />
          </label>
          <label className="field-block">
            <span>Пол</span>
            <select name="gender" defaultValue="Male">
              <option value="Male">Мужской</option>
              <option value="Female">Женский</option>
            </select>
          </label>
          <label className="field-block">
            <span>Кого ищу</span>
            <select name="preferredGender" defaultValue="Female">
              <option value="Female">Девушек</option>
              <option value="Male">Парней</option>
              <option value="Any">Всех</option>
            </select>
          </label>
        </div>

        <div className="form-grid-2">
          <label className="field-block">
            <span>Район</span>
            <input name="district" type="text" defaultValue="Патриаршие / Центр" />
          </label>
          <label className="field-block">
            <span>Интересы (через запятую)</span>
            <input
              name="interestsCsv"
              type="text"
              defaultValue="Specialty кофе,Выставки,Архитектура,Настолки"
            />
          </label>
        </div>

        <label className="field-block">
          <span>О себе</span>
          <textarea
            name="bio"
            rows={2}
            defaultValue="Люблю спонтанные вечерние планы в городе, спешелти-кофе и интересные выставки."
          />
        </label>

        <button type="submit" className="primary-button wide" disabled={busy}>
          {busy ? 'Создание…' : 'Зарегистрироваться'}
        </button>
      </form>
    </section>
  )
}
