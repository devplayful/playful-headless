'use client'

/** Official GHL loader: widgets.leadconnectorhq.com widget 67ac6d90a81d1c5969d763e7. No iframe. */
import { useEffect } from 'react'
import { attachChatWidgetAnalytics } from '@/lib/analytics/chat-widget'
import {
  HIGHLEVEL_CHAT_WIDGET_ID,
  HIGHLEVEL_CHAT_WIDGET_LOADER,
  HIGHLEVEL_EXTERNAL_TRACKING_SRC,
  highLevelScriptPolicy,
} from '@/lib/highlevel/external-tracking'

export default function ChatWidget() {
  const policy = highLevelScriptPolicy(
    process.env.NEXT_PUBLIC_HIGHLEVEL_EXTERNAL_TRACKING_ENABLED === 'true',
  )

  useEffect(() => {
    let loaded = false
    let chatEl: HTMLScriptElement | null = null
    let trackingEl: HTMLScriptElement | null = null
    let idleId = 0
    let timeoutId = 0
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const

    const detach = () => {
      events.forEach((type) => window.removeEventListener(type, load))
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      window.clearTimeout(timeoutId)
    }

    const load = () => {
      if (loaded) return
      loaded = true
      detach()

      if (policy.externalTracking) {
        console.log('🤖 ChatWidget: Iniciando carga del script de LeadConnector...')
        const tracking = document.createElement('script')
        trackingEl = tracking
        tracking.src = HIGHLEVEL_EXTERNAL_TRACKING_SRC
        tracking.setAttribute('data-tracking-id', 'tk_7f428930606f48999b6809f35a288399')
        tracking.async = true
        tracking.onload = () => {
          console.log('✅ ChatWidget: Script de tracking cargado exitosamente')
        }
        tracking.onerror = (error) => {
          console.error('❌ ChatWidget: Error al cargar el script de tracking', error)
        }
        document.body.appendChild(tracking)
      }

      // HighLevel fires LC_chatWidgetLoaded once; hook it before the loader.
      attachChatWidgetAnalytics()

      const chat = document.createElement('script')
      chatEl = chat
      chat.src = HIGHLEVEL_CHAT_WIDGET_LOADER
      chat.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js')
      chat.setAttribute('data-widget-id', HIGHLEVEL_CHAT_WIDGET_ID)
      chat.async = true

      chat.onload = () => {
        console.log('✅ ChatWidget: Widget de High Level cargado')
      }
      chat.onerror = (error) => {
        console.error('❌ ChatWidget: Error al cargar el widget de High Level', error)
      }

      document.body.appendChild(chat)
      console.log('📝 ChatWidget: Script de chat agregado al DOM')
    }

    events.forEach((type) => {
      window.addEventListener(type, load, { once: true, passive: true })
    })
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(load, { timeout: 4000 })
    }
    timeoutId = window.setTimeout(load, 4000)

    return () => {
      detach()
      if (trackingEl && document.body.contains(trackingEl)) {
        document.body.removeChild(trackingEl)
      }
      if (chatEl && document.body.contains(chatEl)) {
        document.body.removeChild(chatEl)
      }
      console.log('🗑️ ChatWidget: Scripts removidos del DOM')
    }
  }, [policy.externalTracking])

  return null
}
