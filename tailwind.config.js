/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                canvas: "var(--canvas)",
                surface: "var(--surface)",
                raised: "var(--raised)",
                line: "var(--line)",
                ink: "var(--ink)",
                muted: "var(--muted)",
                faint: "var(--faint)",
                accent: "var(--accent)",
                "on-accent": "var(--on-accent)",
                danger: "var(--danger)",
            },
            fontFamily: {
                display: [
                    '"Bricolage Grotesque Variable"',
                    "system-ui",
                    "sans-serif",
                ],
            },
        },
    },
    plugins: [],
};
