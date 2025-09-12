# Playful Agency - Documentación Técnica

## 📋 Información General del Proyecto
- **Nombre:** Playful Agency Blog
- **Framework:** Next.js 14.0.0
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Fuentes:** Google Fonts (Paytone One, Montserrat, DM Sans)

## 📦 Dependencias y Versiones

### Dependencias Principales (package.json)
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.0.1",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}
```

### Scripts Disponibles
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 🎨 Configuración de Fuentes

### Google Fonts Utilizadas
1. **Paytone One** - Peso: 400
2. **Montserrat** - Todos los pesos
3. **DM Sans** - Todos los pesos

### Configuración en layout.tsx
```typescript
import { Paytone_One, Montserrat, DM_Sans } from 'next/font/google'

const paytoneOne = Paytone_One({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-paytone-one'
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans'
})
```

### Variables CSS Generadas
- `--font-paytone-one`
- `--font-montserrat`
- `--font-dm-sans`

## 🎯 Clases de Tipografía Personalizadas

### Configuración en globals.css
```css
/* Typography Classes */
@layer components {
  .title-large {
    font-family: var(--font-paytone-one), var(--font-montserrat), sans-serif;
    font-weight: 400;
    line-height: 1.1;
  }
  
  .title-medium {
    font-family: var(--font-paytone-one), var(--font-montserrat), sans-serif;
    font-weight: 400;
    line-height: 1.2;
  }
  
  .title-small {
    font-family: var(--font-paytone-one), var(--font-montserrat), sans-serif;
    font-weight: 400;
    line-height: 1.3;
  }
  
  .subtitle {
    font-family: var(--font-montserrat), sans-serif;
    font-weight: 600;
    line-height: 1.4;
  }
  
  .body-text {
    font-family: var(--font-dm-sans), sans-serif;
    font-weight: 400;
    line-height: 1.6;
  }
  
  .body-text-medium {
    font-family: var(--font-dm-sans), sans-serif;
    font-weight: 500;
    line-height: 1.6;
  }
  
  .body-text-bold {
    font-family: var(--font-dm-sans), sans-serif;
    font-weight: 700;
    line-height: 1.6;
  }
}
```

### Jerarquía de Uso
- **Títulos Principales:** `.title-large` (Paytone One + Montserrat)
- **Títulos Secundarios:** `.title-medium` (Paytone One + Montserrat)
- **Títulos Menores:** `.title-small` (Paytone One + Montserrat)
- **Subtítulos:** `.subtitle` (Montserrat)
- **Texto Normal:** `.body-text` (DM Sans)
- **Texto Destacado:** `.body-text-medium` (DM Sans)
- **Texto Negrita:** `.body-text-bold` (DM Sans)

## 🎨 Configuración de Tailwind CSS

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'title': ['var(--font-paytone-one)', 'var(--font-montserrat)', 'sans-serif'],
        'body': ['var(--font-dm-sans)', 'sans-serif'],
        'paytone': ['var(--font-paytone-one)', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
```

### Clases Tailwind Disponibles
- `font-title` - Paytone One + Montserrat
- `font-body` - DM Sans
- `font-paytone` - Solo Paytone One
- `font-montserrat` - Solo Montserrat
- `font-dm-sans` - Solo DM Sans

## 🏗️ Estructura del Proyecto

### Directorios Principales
```
headless/
├── app/
│   ├── layout.tsx          # Layout principal con fuentes
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales y clases personalizadas
├── components/
│   ├── Header.tsx         # Navegación
│   ├── Footer.tsx         # Pie de página
│   └── ChatWidget.tsx     # Widget de chat flotante
├── package.json           # Dependencias y scripts
├── tailwind.config.ts     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
├── next.config.js         # Configuración de Next.js
├── postcss.config.js      # Configuración de PostCSS
├── run-project.bat        # Script para instalar y ejecutar
└── start-dev.bat          # Script para ejecutar servidor dev
```

## 🎨 Paleta de Colores Utilizada

### Colores Principales
- **Púrpura:** `purple-600`, `purple-700`, `purple-900`
- **Teal:** `teal-400`, `teal-500`
- **Rosa:** `pink-200`, `pink-300`, `pink-400`
- **Azul:** `blue-200`, `blue-300`
- **Amarillo:** `yellow-300`

### Gradientes
- **Fondo Principal:** `bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100`
- **Elementos:** `bg-gradient-to-br from-purple-400 to-pink-400`

## 🚀 Comandos de Ejecución

### Desarrollo
```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar linter
```

### Scripts Batch (Windows)
```batch
# Instalar dependencias y ejecutar
.\run-project.bat

# Solo ejecutar servidor de desarrollo
.\start-dev.bat
```

## 🔧 Configuración de Next.js

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
```

### Características Utilizadas
- **App Router** - Nueva estructura de rutas de Next.js 13+
- **Server Components** - Componentes del servidor por defecto
- **Font Optimization** - Optimización automática de Google Fonts
- **TypeScript** - Soporte completo para TypeScript

## 📱 Componentes Principales

### Header.tsx
- Navegación responsiva
- Logo con círculo púrpura
- Menú desktop y móvil
- Botón CTA "CONTÁCTANOS"

### ChatWidget.tsx
- Widget flotante en esquina inferior derecha
- Chat desplegable funcional
- Notificación con contador
- Diseño moderno con animaciones

### Footer.tsx
- Enlaces organizados en columnas
- Información de contacto
- Redes sociales
- Copyright dinámico

## 🎯 Optimizaciones Implementadas

### Performance
- **Font Display Swap** - Carga optimizada de fuentes
- **CSS-in-JS** - Estilos optimizados con Tailwind
- **Tree Shaking** - Eliminación de código no utilizado
- **Static Generation** - Generación estática cuando es posible

### SEO
- **Metadata** - Títulos y descripciones optimizadas
- **Semantic HTML** - Estructura semántica correcta
- **Font Loading** - Carga optimizada sin FOUT/FOIT

## 🔍 Notas de Desarrollo

### Advertencias Conocidas
- Configuración `appDir` deprecada en Next.js 14 (no afecta funcionamiento)
- Dependencias con advertencias de seguridad menores (no críticas)

### Próximas Mejoras Sugeridas
- Implementar páginas adicionales (Nosotros, Servicios, Blog)
- Agregar sistema de gestión de contenido
- Implementar funcionalidad real del chat
- Optimizar imágenes con next/image
- Agregar tests unitarios
