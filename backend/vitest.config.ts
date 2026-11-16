
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup-env.ts"],
    include: ["src/**/*.test.ts"],
    testTimeout: 10000,
    hookTimeout: 15000,
    fileParallelism: false,
  },
});
