/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: "#0F172A",     // Professional dark background
                primary: "#3B82F6",  // Blue accent for buttons
            }
        },
    },
    plugins: [],
}