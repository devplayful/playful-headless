'use client'

import { useEffect, useState } from 'react'

const GHL_CHAT_SRC =
  'https://api.gohighlevel.com/message/get_chat_widget/3sc1AO5Eju01llYk7Qpr'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    console.log('🤖 ChatWidget: Iniciando carga del script de LeadConnector...')

    const script = document.createElement('script')
    script.src = 'https://api.playfulagency.com/js/external-tracking.js'
    script.setAttribute('data-tracking-id', 'tk_7f428930606f48999b6809f35a288399')
    script.async = true

    script.onload = () => {
      console.log('✅ ChatWidget: Script de LeadConnector cargado exitosamente')

      setTimeout(() => {
        const chatElements = document.querySelectorAll(
          '[id*="chat"], [class*="chat"], [id*="widget"], [class*="widget"], iframe[src*="leadconnector"], iframe[src*="playful"]'
        )
        console.log('🔍 ChatWidget: Elementos de chat encontrados:', chatElements.length)
        if (chatElements.length > 0) {
          console.log('📍 ChatWidget: Elementos encontrados:', chatElements)
        } else {
          console.warn(
            '⚠️ ChatWidget: No se encontraron elementos del chat. Puede que el script solo funcione en producción.'
          )
        }
      }, 2000)
    }

    script.onerror = (error) => {
      console.error('❌ ChatWidget: Error al cargar el script de LeadConnector', error)
    }

    document.body.appendChild(script)
    console.log('📝 ChatWidget: Script agregado al DOM')

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
        console.log('🗑️ ChatWidget: Script removido del DOM')
      }
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      {open && (
        <div className="pointer-events-auto w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#4B0082] px-4 py-3 text-white">
            <p className="text-sm font-semibold">Chat con Playful</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="text-sm font-medium text-white/90 hover:text-white"
            >
              Cerrar
            </button>
          </div>
          <iframe
            src={GHL_CHAT_SRC}
            title="Chat de Playful Agency"
            frameBorder="0"
            scrolling="auto"
            width="100%"
            height="500"
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        aria-expanded={open}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4B0082] text-white shadow-lg hover:bg-[#3D006B]"
      >
        {open ? (
          <span className="text-2xl leading-none" aria-hidden>
            ×
          </span>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.942L3 20l1.06-3.18A7.5 7.5 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
