# Configuración de Google Analytics 4 (GA4)

## 📊 Implementación completada

Google Analytics 4 ha sido integrado directamente en el proyecto Next.js usando `gtag.js`.

## 🔧 Configuración requerida

### 1. Obtén tu Measurement ID

Ve a tu cuenta de Google Analytics:
1. Accede a [analytics.google.com](https://analytics.google.com)
2. Selecciona tu propiedad
3. Ve a **Admin** > **Data Streams** > Selecciona tu stream web
4. Copia el **Measurement ID** (formato: `G-XXXXXXXXXX`)

### 2. Configura la variable de entorno

Agrega el Measurement ID a tu archivo `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**⚠️ Importante:** Reemplaza `G-XXXXXXXXXX` con tu ID real.

### 3. Deploy

Después de configurar la variable de entorno:
- **Local:** Reinicia el servidor de desarrollo (`npm run dev`)
- **Producción:** Asegúrate de agregar la variable en tu plataforma de deploy (Vercel, Netlify, etc.)

## 📁 Archivos creados/modificados

### Nuevo componente
- `components/GoogleAnalytics.tsx` - Componente con script de gtag.js

### Archivos modificados
- `app/layout.tsx` - Integración de GA4 en el `<head>`
- `.env.example` - Variable de entorno documentada

## ✅ Verificación

### En desarrollo
Abre las DevTools del navegador:
1. Pestaña **Network**
2. Filtra por "gtag" o "google-analytics"
3. Deberías ver requests a `www.googletagmanager.com/gtag/js`

### En producción
1. Instala la extensión **Google Analytics Debugger** para Chrome
2. O verifica en tiempo real desde Google Analytics:
   - **Reports** > **Realtime** > Deberías verte navegando

## 🎯 Eventos automáticos rastreados

GA4 rastrea automáticamente:
- ✅ Page views (vistas de página)
- ✅ Scrolls
- ✅ Outbound clicks
- ✅ File downloads
- ✅ Video engagement
- ✅ Site search

## 🔄 Coexistencia con GTM

Este proyecto tiene:
- **Google Tag Manager (GTM):** Variable `NEXT_PUBLIC_GTM_ID`
- **Google Analytics 4 (GA4):** Variable `NEXT_PUBLIC_GA_MEASUREMENT_ID`

Ambos pueden coexistir sin problemas:
- **GTM** gestiona múltiples tags desde su interfaz
- **GA4 directo** garantiza rastreo incluso si GTM falla

## 📚 Recursos adicionales

- [Documentación GA4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js + Google Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [Eventos personalizados](https://developers.google.com/analytics/devguides/collection/ga4/events)

## 💡 Eventos personalizados (opcional)

Para trackear eventos personalizados, usa:

```typescript
// En cualquier componente cliente
'use client'

const handleClick = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'button_click', {
      event_category: 'engagement',
      event_label: 'Contact Form',
      value: 1
    });
  }
}
```

Recuerda agregar tipos en `global.d.ts` si es necesario:

```typescript
interface Window {
  gtag: (...args: any[]) => void;
  dataLayer: any[];
}
```
