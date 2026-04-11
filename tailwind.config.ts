import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--bg)",
                glass: "var(--glass)",
                "glass-hover": "var(--glass-hover)",
                border: "var(--border)",
                neon: "var(--neon)",
                "neon-cyan": "var(--neon-cyan)",
                "neon-purple": "var(--neon-purple)",
                text: "var(--text)",
                "text-muted": "var(--text-muted)",
            },
        },
    },
    plugins: [],
};
export default config;
