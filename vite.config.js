import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '' },  // Копіює manifest.json в корінь dist/
        { src: 'icons/**/*', dest: 'icons' },  // Копіює іконки в dist/icons
        { src: 'background/background.js', dest: 'background' }  // Копіює background.js в dist/background
      ]
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup/popup.html',
        background: 'background/background.js', // Вказуємо вхідний файл для background
      },
      output: {
        entryFileNames: '[name].js',
        assetsDir: 'assets',
      },
    },
  },
});
