/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Neumorphic Color Palette - Light Pastels
                neumorphic: {
                    base: "#E8E8E8", // Base background
                    light: "#F5F5F5", // Light highlight
                    dark: "#D1D1D1", // Dark shadow
                    surface: "#EEEEEE", // Surface color
                    accent: {
                        50: "#F0F4F8",
                        100: "#E2E8F0",
                        200: "#CBD5E1",
                        300: "#94A3B8",
                    },
                    pastel: {
                        blue: "#B8D4E3",
                        green: "#C4E4D4",
                        orange: "#F4D1AE",
                        pink: "#F2C2D1",
                        purple: "#D4C5E8",
                    }
                },
                // Legacy support
                primary: "#E8E8E8",
                secondary: "#D1D1D1",
            },
            boxShadow: {
                'neumorphic': '8px 8px 16px #D1D1D1, -8px -8px 16px #FFFFFF',
                'neumorphic-inset': 'inset 4px 4px 8px #D1D1D1, inset -4px -4px 8px #FFFFFF',
                'neumorphic-pressed': 'inset 4px 4px 8px #D1D1D1, inset -4px -4px 8px #FFFFFF',
            }
        },
    },
    plugins: [],
}