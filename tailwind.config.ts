import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(255 255 255)',
        foreground: 'rgb(15 23 42)',
        card: 'rgb(248 250 252)',
        'card-foreground': 'rgb(15 23 42)',
        primary: {
          DEFAULT: 'rgb(59 130 246)',
          foreground: 'rgb(255 255 255)',
        },
        secondary: {
          DEFAULT: 'rgb(241 245 249)',
          foreground: 'rgb(15 23 42)',
        },
        muted: {
          DEFAULT: 'rgb(241 245 249)',
          foreground: 'rgb(100 116 139)',
        },
        accent: {
          DEFAULT: 'rgb(241 245 249)',
          foreground: 'rgb(15 23 42)',
        },
        destructive: {
          DEFAULT: 'rgb(239 68 68)',
          foreground: 'rgb(255 255 255)',
        },
        border: 'rgb(226 232 240)',
        input: 'rgb(226 232 240)',
        ring: 'rgb(59 130 246)',
      },
      borderRadius: {
        lg: '0.75rem',
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
