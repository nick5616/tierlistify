import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.test.ts", "netlify/lib/**/*.test.ts"],
    },
});
