/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paper — the warm bone ground the whole site sits on.
        paper: {
          50: '#FFFDF6',
          100: '#FBF6E9',
          200: '#F4EDD9',
          300: '#EAE0C4',
          400: '#DCCEA8',
        },
        // Ink — the single black used for every border, rule and shadow.
        ink: {
          DEFAULT: '#141210',
          900: '#141210',
          800: '#26221D',
          700: '#3D3730',
          500: '#6B6357',
          400: '#8C8375',
        },
        // Flat, saturated accents. Used as fills, never as gradients.
        electric: '#2B44FF',
        acid: '#FFE01F',
        flare: '#FF4A1C',
        lime: '#A6F32B',
        grape: '#8B3DFF',
        blush: '#FF74B0',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Archivo Black"', '"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderWidth: {
        3: '3px',
        5: '5px',
        6: '6px',
      },
      // Hard offset shadows — no blur, no spread. The whole look hangs on these.
      boxShadow: {
        'brut-xs': '2px 2px 0 0 #141210',
        'brut-sm': '3px 3px 0 0 #141210',
        brut: '5px 5px 0 0 #141210',
        'brut-lg': '8px 8px 0 0 #141210',
        'brut-xl': '12px 12px 0 0 #141210',
        'brut-inset': 'inset 3px 3px 0 0 #141210',
        // Coloured variants for panels that sit on ink
        'brut-acid': '5px 5px 0 0 #FFE01F',
        'brut-electric': '5px 5px 0 0 #2B44FF',
        'brut-paper': '5px 5px 0 0 #FBF6E9',
      },
      backgroundImage: {
        stripes:
          'repeating-linear-gradient(45deg, #141210 0 8px, transparent 8px 16px)',
        'stripes-acid':
          'repeating-linear-gradient(45deg, #FFE01F 0 10px, #141210 10px 20px)',
        grid: 'linear-gradient(#141210 1px, transparent 1px), linear-gradient(90deg, #141210 1px, transparent 1px)',
        halftone: 'radial-gradient(#141210 1.5px, transparent 1.6px)',
      },
      backgroundSize: {
        grid: '32px 32px',
        halftone: '12px 12px',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(10px) scale(.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slam-in': {
          '0%': { opacity: '0', transform: 'translateY(-14px)' },
          '60%': { opacity: '1', transform: 'translateY(3px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-up-in': {
          from: { transform: 'translateY(110%)' },
          to: { transform: 'translateY(0)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'ping-square': {
          '0%': { transform: 'scale(.8)', opacity: '.8' },
          '80%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 34s) linear infinite',
        blink: 'blink 1.1s steps(1) infinite',
        'pop-in': 'pop-in .26s cubic-bezier(.2,.9,.3,1.2) both',
        'fade-in': 'fade-in .25s ease both',
        'slam-in': 'slam-in .5s cubic-bezier(.2,.9,.3,1.15) both',
        'slide-up-in': 'slide-up-in .38s cubic-bezier(.2,.9,.3,1.1) both',
        wobble: 'wobble 3.5s ease-in-out infinite',
        'ping-square': 'ping-square 2.2s cubic-bezier(.2,.6,.3,1) infinite',
      },
      transitionTimingFunction: {
        snap: 'cubic-bezier(.2,.9,.3,1.15)',
      },
    },
  },
  plugins: [],
}
