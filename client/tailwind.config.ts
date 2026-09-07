import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        honey: {
          light: '#FFD04B',
          DEFAULT: '#F4A622',
          rich: '#E8960A',
          pale: '#FFF3CC',
        },
        brown: {
          DEFAULT: '#5C3A0A',
          mid: '#8B5E2A',
        },
        cream: '#FFFBF0',
      },
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
