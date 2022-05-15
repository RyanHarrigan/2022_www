/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */

// see https://tailwindcss.com/docs/optimizing-for-production
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}'
    ],
    darkMode: 'media', // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                'serif': 'Courier New, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;'
            },

            dropShadow: {
                'yellow': '0 0px 2px rgba(234, 179, 8, 1)',
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
