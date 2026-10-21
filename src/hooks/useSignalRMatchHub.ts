import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import type { ChatMessageDto } from '../types/vibe.ts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080'

interface UseSignalRMatchHubOptions {
  token: string | null
  userId: number | null
  activeMatchPairId: number | null
  onReceiveMessage?: (msg: ChatMessageDto) => void
  onMatchCreated?: (payload: {
    matchPairId: number
    matchedActivityContext: string
    compatibilityScore: number
    partnerName: string
  }) => void
}

export function useSignalRMatchHub({
  token,
  userId,
  activeMatchPairId,
  onReceiveMessage,
  onMatchCreated,
}: UseSignalRMatchHubOptions) {
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    if (!token || !userId) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/match-chat`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveMessage', (msg: ChatMessageDto) => {
      onReceiveMessage?.(msg)
    })

    connection.on('MatchCreated', (payload) => {
      onMatchCreated?.(payload)
    })

    connection
      .start()
      .then(() => {
        void connection.invoke('JoinUserChannel', userId)
        if (activeMatchPairId) {
          void connection.invoke('JoinMatchRoom', activeMatchPairId)
        }
      })
      .catch(() => {
        /* ignore initial connection error if offline */
      })

    connectionRef.current = connection

    return () => {
      void connection.stop()
      connectionRef.current = null
    }
  }, [token, userId, activeMatchPairId, onReceiveMessage, onMatchCreated])
}
