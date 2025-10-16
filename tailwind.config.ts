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
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Personalizar el Ancho (width)
      width: {
        '320p': '320px', // Clase resultante: w-60p
      },
      // Personalizar la Altura (height)
      height: {
        '444p': '444px', // Clase resultante: h-90p
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')({
      target: 'modern',
      css: {
        h1: {
          fontFamily: 'paytone, sans-serif',
        },
        h2: {
          fontFamily: 'paytone, sans-serif',
        },
        h3: {
          fontFamily: 'paytone, sans-serif',
        },
        h4: {
          fontFamily: 'paytone, sans-serif',
        },
        h5: {
          fontFamily: 'paytone, sans-serif',
        },
        h6: {
          fontFamily: 'paytone, sans-serif',
        },
        p: {
          fontFamily: 'DM Sans, sans-serif',
        },
      },
    }),
  ],
}
export default config
