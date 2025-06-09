import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import { resolve } from 'path';

export default defineConfig({
  plugins: [createVuePlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'Vue2Wrapper',
      fileName: format => `vue2wrapper.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', '@vue/web-component-wrapper'],
      output: {
        globals: {
          vue: 'Vue',
          '@vue/web-component-wrapper': 'wrap',
        },
      },
    },
  },
  server: {
    port: 3000,
    open: '/dev/index.html',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
