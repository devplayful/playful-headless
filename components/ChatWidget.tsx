'use client'

/** Official GHL loader: widgets.leadconnectorhq.com widget 67ac6d90a81d1c5969d763e7. No iframe. */
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { attachChatWidgetAnalytics } from '@/lib/analytics/chat-widget'
import { attachChatWidgetDeferredLoad } from '@/lib/chat-widget-deferred-load'
import {
  HIGHLEVEL_CHAT_WIDGET_ID,
  HIGHLEVEL_CHAT_WIDGET_LOADER,
  HIGHLEVEL_EXTERNAL_TRACKING_SRC,
  highLevelScriptPolicy,
} from '@/lib/highlevel/external-tracking'

export default function ChatWidget() {
  const pathname = usePathname()
  const policy = highLevelScriptPolicy(
    process.env.NEXT_PUBLIC_HIGHLEVEL_EXTERNAL_TRACKING_ENABLED === 'true',
  )

  useEffect(() => {
    if (pathname === '/links') {
      return undefined
    }
    let chatEl: HTMLScriptElement | null = null
    let trackingEl: HTMLScriptElement | null = null

    const load = () => {
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

    const handle = attachChatWidgetDeferredLoad(load)

    return () => {
      handle.cancel()
      if (trackingEl && document.body.contains(trackingEl)) {
        document.body.removeChild(trackingEl)
      }
      if (chatEl && document.body.contains(chatEl)) {
        document.body.removeChild(chatEl)
      }
      console.log('🗑️ ChatWidget: Scripts removidos del DOM')
    }
  }, [pathname, policy.externalTracking])

  if (pathname === '/links') {
    return null
  }

  return null
}
