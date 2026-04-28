import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Mirrors former tsconfig.jest paths: `@ks/<pkg>` → `packages/<pkg>/src` */
function ksAlias(): Record<string, string> {
  const pkgs = ['promise', 'reactive', 'vue2component', 'vue2wrapper'] as const;
  return Object.fromEntries(pkgs.map(name => [`@ks/${name}`, path.resolve(__dirname, `packages/${name}/src`)]));
}

export default defineConfig({
  resolve: {
    alias: ksAlias(),
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['packages/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['json', 'lcov', 'text', 'clover'],
      reportsDirectory: 'coverage',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/node_modules/**'],
    },
  },
});
