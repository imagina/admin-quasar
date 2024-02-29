/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

module.exports = {
  prefix: 'tw-',
  content: ["./src/**/*.{html,js,ts,vue}"],
  safelist: [
    'tw-bg-blue-400',
    'tw-bg-red-500',
    'tw-bg-green-500',
    'tw-bg-cyan-400',
    'tw-text-cyan-400',
    'tw-bg-yellow-400',
    'tw-text-yellow-400',
    'tw-bg-gray-400',
    'tw-border-pink-400',
    'tw-border-orange-400',
  ],
  theme: {
    extend: {
      colors: {
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
        gray: colors.neutral,
        blue: colors.blue,
        red: colors.red,
      }
    },
  },
  plugins: [],
}
