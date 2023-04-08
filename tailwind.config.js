module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}", // Note the addition of the `app` directory.
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Roboto', 'sans-serif']
            },

            fontSize: {
                "tiny": "0.813rem",
                "md": "1.063rem",
                "5xl": "2.65rem",
                "6xl": "2.75rem",
            },

            maxWidth: {
                'xxs': '16rem'
            },

            height: {
                '96': '24rem',
            },

            borderWidth: {
                '3': '3px',
            },

            margin: {
                '13': '3.25rem',
            },

            padding: {
                'full': '100%',
            },

            textDecorationThickness: {
                3: '3px',
            },

            translate: {
                '4/5': '80%',
            },

            animation: {
                orbit: 'orbit 2.5s linear infinite',
            },

            keyframes: {
                "orbit": {
                    '0%': {
                        transform: 'rotate(0deg) translate(-0.25rem) rotate(0deg)',
                    },

                    '100%': {
                        transform: 'rotate(360deg) translate(-0.25rem) rotate(-360deg);',
                    }
                }
            },
        },
    },

    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio')
    ],
}
