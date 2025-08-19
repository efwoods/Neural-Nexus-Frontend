//tailwind.config.js

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
       keyframes: {
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-down": "slide-down 0.3s ease-out",
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('portrait', '@media (orientation: portrait)');
      addVariant('landscape', '@media (orientation: landscape)');
    },
  ], 
};
