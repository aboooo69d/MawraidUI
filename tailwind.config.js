import colors from 'tailwindcss/colors'

const token = (name) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `var(--mw-${name})`
    : `color-mix(in srgb, var(--mw-${name}) calc(${opacityValue} * 100%), transparent)`

const palette = (shades) => Object.fromEntries(
  Object.entries(shades).map(([shade, name]) => [shade, token(name)])
)

const status = (name, solid) => ({
  ...palette({
    50: `${name}-soft`, 100: `${name}-soft`, 200: `${name}-border`, 300: `${name}-border`,
    400: `${name}-ink`, 500: `${name}-ink`, 600: `${name}-ink`, 700: `${name}-ink`,
    800: `${name}-ink`, 900: `${name}-ink`, 950: `${name}-ink`,
  }),
  solid,
})

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Tajawal', 'Noto Sans Arabic', 'system-ui', 'sans-serif'] },
      boxShadow: { xs: 'var(--mw-shadow-xs)', card: 'var(--mw-shadow-card)' },
      spacing: {
        1: 'var(--mw-space-1)', 2: 'var(--mw-space-2)', 3: 'var(--mw-space-3)',
        4: 'var(--mw-space-4)', 6: 'var(--mw-space-6)', 8: 'var(--mw-space-8)',
        12: 'var(--mw-space-12)', 13: '3.25rem', 18: '4.5rem',
      },
      borderRadius: {
        lg: 'var(--mw-radius-sm)', xl: 'var(--mw-radius-md)',
        '2xl': 'var(--mw-radius-lg)', '3xl': 'var(--mw-radius-xl)',
      },
      borderWidth: { 3: '3px' },
      colors: {
        white: colors.white,
        canvas: token('background'),
        'on-accent': token('on-accent'),
        scrim: token('scrim'),
        slate: palette({
          50: 'surface', 100: 'surface-raised', 200: 'border', 300: 'control-border',
          400: 'text-muted', 500: 'text-muted', 600: 'text-secondary',
          700: 'text-secondary', 800: 'text', 900: 'text', 950: 'text',
        }),
        mawarid: palette({
          50: 'accent-soft', 100: 'accent-soft', 200: 'accent-border', 300: 'accent-border',
          400: 'accent', 500: 'accent', 600: 'accent', 700: 'accent-ink',
          800: 'accent-hover', 900: 'accent-hover', 950: 'accent-hover',
        }),
        amber: status('warning', '#8a530f'),
        emerald: status('success', '#087052'),
        rose: status('error', '#b31943'),
        sky: status('info', '#0369a1'),
      },
    },
  },
}
