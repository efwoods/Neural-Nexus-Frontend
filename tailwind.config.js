module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Covers all JS/TS/JSX/TSX files in src
    "./src/components/Landing/**/*.{js,jsx}", // Explicitly include Landing components
  ],
  theme: {
    extend: {
      screens: {
        // Desktop breakpoint (web)
        'web': '1024px',

        // Mobile portrait and landscape based on orientation and max-width
        'mobile-portrait': { 'raw': '(max-width: 640px) and (orientation: portrait)' },
        'mobile-landscape': { 'raw': '(max-width: 640px) and (orientation: landscape)' },
      },
    },
  },
  plugins: [],
};
