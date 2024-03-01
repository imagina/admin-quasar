/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

const dynamicClasses = [];

Object.keys(colors).forEach((colorKey) => {
  if (typeof colors[colorKey] === 'object') {
    Object.keys(colors[colorKey]).forEach((tone) => {
      dynamicClasses.push(`tw-bg-${colorKey}-${tone}`);
      dynamicClasses.push(`tw-text-${colorKey}-${tone}`);
      dynamicClasses.push(`tw-border-${colorKey}-${tone}`);
    });
  } else {
    dynamicClasses.push(`tw-bg-${colorKey}`);
    dynamicClasses.push(`tw-text-${colorKey}`);
    dynamicClasses.push(`tw-border-${colorKey}`);
  }
});

module.exports = {
  prefix: 'tw-',
  content: ["./src/**/*.{html,js,ts,vue}"],
  safelist: [...dynamicClasses],
  theme: {
    extend: {
      colors: {
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
        gray: colors.neutral,
        blue: colors.blue,
        red: colors.red,
        slate: colors.slate,
      }
    },
  },
  plugins: [],
};
