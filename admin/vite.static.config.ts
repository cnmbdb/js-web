import { resolve } from 'node:path'
import { defineConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  base: '/admin/',
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), viteReact()],
  build: {
    emptyOutDir: true,
    outDir: '../_site/admin',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'static/index.html'),
      },
    },
  },
})
