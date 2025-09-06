import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/portfolio/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}))
