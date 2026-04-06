/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Midnight Teal" (brand option A): near-black base + teal primary
        brand: {
          void: '#070d0f',
          surface: '#0f1a1c',
        },
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        /* Semantic accents — values mirror src/styles/tokens.css */
        social: 'var(--ecke-accent-social)',
        'social-hover': 'var(--ecke-accent-social-hover)',
        /** Matches `tokens.css` --ecke-focus; use with `ring-ecke-focus` for focus rings */
        'ecke-focus': 'var(--ecke-focus)',
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['var(--font-ecke-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-ecke-serif)', 'Georgia', 'serif'],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      spacing: {
        'ecke-0': 'var(--ecke-space-0)',
        'ecke-1': 'var(--ecke-space-1)',
        'ecke-2': 'var(--ecke-space-2)',
        'ecke-3': 'var(--ecke-space-3)',
        'ecke-4': 'var(--ecke-space-4)',
        'ecke-5': 'var(--ecke-space-5)',
        'ecke-6': 'var(--ecke-space-6)',
        'ecke-7': 'var(--ecke-space-7)',
        'ecke-8': 'var(--ecke-space-8)',
        'ecke-9': 'var(--ecke-space-9)',
        'ecke-10': 'var(--ecke-space-10)',
        'ecke-11': 'var(--ecke-space-11)',
        'ecke-12': 'var(--ecke-space-12)',
        'ecke-14': 'var(--ecke-space-14)',
        'ecke-16': 'var(--ecke-space-16)',
        'ecke-20': 'var(--ecke-space-20)',
        'ecke-24': 'var(--ecke-space-24)',
        'ecke-section': 'var(--ecke-section-py)',
        'ecke-section-md': 'var(--ecke-section-py-md)',
        'ecke-section-lg': 'var(--ecke-section-py-lg)',
      },
      boxShadow: {
        'elegant': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'elegant-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      },
      transitionDuration: {
        ecke: '300ms',
        'ecke-fast': '200ms',
        'ecke-slow': '500ms',
      },
      transitionTimingFunction: {
        'ecke-out': 'ease-out',
        'ecke-in-out': 'ease-in-out',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'gradient-x': 'gradientX 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        gradientX: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

