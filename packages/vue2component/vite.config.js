import { resolve } from 'node:path'
import process from 'node:process'
import vue2 from '@vitejs/plugin-vue2'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue2(),
    dts({
      include: ['src/**/*.vue', 'src/**/*.ts'],
      outputDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'Vue2Login',
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  server: {
    port: 3011,
    open: true,
  },
  root: process.env.NODE_ENV === 'development' ? 'dev' : '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
