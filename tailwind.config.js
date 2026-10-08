export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'on-ink': 'rgb(var(--color-on-ink) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        float: '0 1px 2px rgb(0 0 0 / 0.06), 0 10px 28px -10px rgb(0 0 0 / 0.35)',
      },
      transitionTimingFunction: {
        snappy: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
};
