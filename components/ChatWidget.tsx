'use client'

import { useEffect } from 'react'

export default function ChatWidget() {
  useEffect(() => {
    console.log('🤖 ChatWidget: Iniciando carga del script de LeadConnector...')

    const tracking = document.createElement('script')
    tracking.src = 'https://api.playfulagency.com/js/external-tracking.js'
    tracking.setAttribute('data-tracking-id', 'tk_7f428930606f48999b6809f35a288399')
    tracking.async = true

    tracking.onload = () => {
      console.log('✅ ChatWidget: Script de tracking cargado exitosamente')
    }
    tracking.onerror = (error) => {
      console.error('❌ ChatWidget: Error al cargar el script de tracking', error)
    }

    const chat = document.createElement('script')
    chat.src = 'https://widgets.leadconnectorhq.com/loader.js'
    chat.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js')
    chat.setAttribute('data-widget-id', '67ac6d90a81d1c5969d763e7')
    chat.async = true

    chat.onload = () => {
      console.log('✅ ChatWidget: Widget de High Level cargado')
    }
    chat.onerror = (error) => {
      console.error('❌ ChatWidget: Error al cargar el widget de High Level', error)
    }

    document.body.appendChild(tracking)
    document.body.appendChild(chat)
    console.log('📝 ChatWidget: Scripts agregados al DOM')

    return () => {
      if (document.body.contains(tracking)) {
        document.body.removeChild(tracking)
      }
      if (document.body.contains(chat)) {
        document.body.removeChild(chat)
      }
      console.log('🗑️ ChatWidget: Scripts removidos del DOM')
    }
  }, [])

  return null
}
