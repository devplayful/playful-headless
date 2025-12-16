import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // DM Sans como fuente por defecto del sitio
        sans: ['var(--font-dm-sans)', ...fontFamily.sans],
        // Aliases adicionales para uso específico
        'title': ['var(--font-paytone-one)', 'var(--font-montserrat)', 'sans-serif'],
        'body': ['var(--font-dm-sans)', 'sans-serif'],
        'paytone': ['var(--font-paytone-one)', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Personalizar el Ancho (width)
      width: {
        '320p': '320px',
      },
      // Personalizar la Altura (height)
      height: {
        '444p': '444px',
      }
    },
  },
  plugins: [
    typography,
    require('@tailwindcss/typography')({
      target: 'modern',
      css: {
        h1: {
          fontFamily: 'var(--font-paytone-one), sans-serif',
        },
        h2: {
          fontFamily: 'var(--font-paytone-one), sans-serif',
        },
        h3: {
          fontFamily: 'var(--font-paytone-one), sans-serif',
        },
        h4: {
          fontFamily: 'var(--font-paytone-one), sans-serif',
        },
        h5: {
          fontFamily: 'var(--font-paytone-one), sans-serif',
        },
        h6: {
          fontFamily: 'var(--font-paytone-one), sans-serif',
        },
        p: {
          fontFamily: 'var(--font-dm-sans), sans-serif',                   
        },
      },
    }),
  ],
}

export default config
