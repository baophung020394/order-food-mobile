/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Glassmorphism Color Palette - Vibrant backgrounds
                glass: {
                    bg: {
                        blue: "rgba(59, 130, 246, 0.5)",
                        purple: "rgba(147, 51, 234, 0.5)",
                        pink: "rgba(236, 72, 153, 0.5)",
                        gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.8))",
                    },
                    surface: "rgba(255, 255, 255, 0.1)",
                    border: "rgba(255, 255, 255, 0.2)",
                    text: "rgba(255, 255, 255, 0.9)",
                    textLight: "rgba(255, 255, 255, 0.7)",
                },
                // Legacy support
                primary: "#3B82F6",
                secondary: "#9333EA",
            },
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '24px',
                '3xl': '32px',
            }
        },
    },
    plugins: [],
}