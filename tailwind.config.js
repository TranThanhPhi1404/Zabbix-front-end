/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js}"],
    theme: {
        extend: {
            animation: {
                'spin-slow': 'spin 2.5s linear infinite', 
                'blink': 'blink 1.5s infinite',
                'gradient-flow': 'gradient-move 3s linear infinite',
            },
            keyframes: {
                'blink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0 },
                },
                'gradient-move': {
                    '0%': { 'background-position': '0% 50%' },
                    '100%': { 'background-position': '100% 50%' },
                },
            },
            backgroundSize: {
                '200%': '200% 200%',
            },
        },
    },
    plugins: [],
}