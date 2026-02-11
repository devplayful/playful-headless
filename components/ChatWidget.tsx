'use client'

import { useEffect } from 'react'

export default function ChatWidget() {
  useEffect(() => {
    console.log('🤖 ChatWidget: Iniciando carga del script de LeadConnector...')
    
    // Crear el script element
    const script = document.createElement('script')
    script.src = 'https://api.playfulagency.com/js/external-tracking.js'
    script.setAttribute('data-tracking-id', 'tk_7f428930606f48999b6809f35a288399')
    script.async = true
    
    script.onload = () => {
      console.log('✅ ChatWidget: Script de LeadConnector cargado exitosamente')
      
      // Verificar después de 2 segundos si el script creó algún elemento
      setTimeout(() => {
        const chatElements = document.querySelectorAll('[id*="chat"], [class*="chat"], [id*="widget"], [class*="widget"], iframe[src*="leadconnector"], iframe[src*="playful"]')
        console.log('🔍 ChatWidget: Elementos de chat encontrados:', chatElements.length)
        if (chatElements.length > 0) {
          console.log('📍 ChatWidget: Elementos encontrados:', chatElements)
        } else {
          console.warn('⚠️ ChatWidget: No se encontraron elementos del chat. Puede que el script solo funcione en producción.')
        }
      }, 2000)
    }
    
    script.onerror = (error) => {
      console.error('❌ ChatWidget: Error al cargar el script de LeadConnector', error)
    }
    
    // Agregar el script al documento
    document.body.appendChild(script)
    console.log('📝 ChatWidget: Script agregado al DOM')
    
    // Cleanup: remover el script cuando el componente se desmonte
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
        console.log('🗑️ ChatWidget: Script removido del DOM')
      }
    }
  }, [])

  return null
}
