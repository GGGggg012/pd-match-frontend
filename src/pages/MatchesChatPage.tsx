import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vibeApi } from '../api/index.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { useSignalRMatchHub } from '../hooks/useSignalRMatchHub.ts'
import type { ChatMessageDto, MatchPairSummaryDto } from '../types/vibe.ts'

export function MatchesChatPage() {
  const { user, token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPairId = Number(searchParams.get('pairId')) || null

  const [matches, setMatches] = useState<MatchPairSummaryDto[]>([])
  const [activePairId, setActivePairId] = useState<number | null>(initialPairId)
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const loadMatches = useCallback(async () => {
    const list = await vibeApi.getMyMatches()
    setMatches(list)
    if (!activePairId && list.length > 0) {
      setActivePairId(list[0].matchPairId)
    }
  }, [activePairId])

  const loadMessages = useCallback(async (pairId: number) => {
    const list = await vibeApi.getMessages(pairId)
    setMessages(list)
  }, [])

  useEffect(() => {
    void loadMatches()
  }, [loadMatches])

  useEffect(() => {
    if (activePairId) {
      void loadMessages(activePairId)
    }
  }, [activePairId, loadMessages])

  const handleIncomingSignalRMessage = useCallback(
    (msg: ChatMessageDto) => {
      if (msg.matchPairId === activePairId) {
        setMessages((prev) =>
          prev.some((existing) => existing.id === msg.id) ? prev : [...prev, msg],
        )
      }
      void loadMatches()
    },
    [activePairId, loadMatches],
  )

  useSignalRMatchHub({
    token,
    userId: user?.id ?? null,
    activeMatchPairId: activePairId,
    onReceiveMessage: handleIncomingSignalRMessage,
    onMatchCreated: () => {
      void loadMatches()
    },
  })

  const activeMatch = matches.find((m) => m.matchPairId === activePairId) ?? null

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!activePairId || !draft.trim()) return
    setSending(true)
    try {
      const sent = await vibeApi.sendMessage(activePairId, draft.trim())
      setMessages((prev) =>
        prev.some((existing) => existing.id === sent.id) ? prev : [...prev, sent],
      )
      setDraft('')
      void loadMatches()
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="chat-layout">
      <aside className="matches-sidebar">
        <h2 className="sidebar-heading">Взаимные Вайб-мэтчи ({matches.length})</h2>
        {matches.length === 0 ? (
          <p className="page-muted">
            Пока нет активных диалогов. Лайкни **Алину** или **Софию** в ленте — они уже оценили
            твой профиль, и чат сразу откроется с контекстом вашего общего «Вайба дня»!
          </p>
        ) : (
          <div className="match-list">
            {matches.map((m) => (
              <button
                key={m.matchPairId}
                type="button"
                className={`match-list-item ${m.matchPairId === activePairId ? 'active' : ''}`}
                onClick={() => {
                  setActivePairId(m.matchPairId)
                  setSearchParams({ pairId: String(m.matchPairId) })
                }}
              >
                <img src={m.partnerAvatarUrl} alt={m.partnerName} className="match-avatar" />
                <div className="match-item-info">
                  <div className="match-item-top">
                    <strong>
                      {m.partnerName}, {m.partnerAge}
                    </strong>
                    <span className="match-item-score">⚡ {m.compatibilityScore}%</span>
                  </div>
                  <div className="match-item-context">{m.matchedActivityContext}</div>
                  {m.lastMessagePreview ? (
                    <div className="match-item-preview">{m.lastMessagePreview}</div>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      <main className="chat-window">
        {!activeMatch ? (
          <div className="chat-empty-state">
            <h3>Выбери мэтч слева, чтобы обсудить детали встречи</h3>
          </div>
        ) : (
          <>
            <header className="chat-header">
              <div className="chat-partner-meta">
                <img
                  src={activeMatch.partnerAvatarUrl}
                  alt={activeMatch.partnerName}
                  className="chat-header-avatar"
                />
                <div>
                  <h3>
                    {activeMatch.partnerName}, {activeMatch.partnerAge} •{' '}
                    <span className="chat-district">{activeMatch.partnerDistrict}</span>
                  </h3>
                  <div className="chat-context-banner">
                    🔥 {activeMatch.matchedActivityContext}
                  </div>
                </div>
              </div>
              <span className="signalr-live-pill">● SignalR Real-Time</span>
            </header>

            <div className="chat-messages-box">
              {messages.map((msg) =>
                msg.isSystemContextBanner ? (
                  <div key={msg.id} className="system-context-msg">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className={`chat-bubble-row ${msg.senderId === user?.id ? 'mine' : 'theirs'}`}
                  >
                    <div className="chat-bubble">
                      <div className="chat-bubble-sender">{msg.senderName}</div>
                      <div className="chat-bubble-text">{msg.text}</div>
                    </div>
                  </div>
                ),
              )}
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Напиши, во сколько и где встречаемся по нашему вайбу…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="primary-button" disabled={sending}>
                Отправить
              </button>
            </form>
          </>
        )}
      </main>
    </section>
  )
}
