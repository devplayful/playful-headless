'use client'

/** Official GHL loader: widgets.leadconnectorhq.com widget 67ac6d90a81d1c5969d763e7. No iframe. */
import { useEffect } from 'react'
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
    if (!policy.externalTracking) return

    console.log('🤖 ChatWidget: Iniciando carga del script de LeadConnector...')

    const tracking = document.createElement('script')
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

    return () => {
      if (document.body.contains(tracking)) {
        document.body.removeChild(tracking)
      }
      console.log('🗑️ ChatWidget: Script de tracking removido del DOM')
    }
  }, [policy.externalTracking])

  useEffect(() => {
    const chat = document.createElement('script')
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

    return () => {
      if (document.body.contains(chat)) {
        document.body.removeChild(chat)
      }
      console.log('🗑️ ChatWidget: Scripts removidos del DOM')
    }
  }, [])

  return null
}
