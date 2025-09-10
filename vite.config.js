import { defineConfig } from 'vite'

const isPreview = process.argv.some(arg => arg.includes('preview'))

export default defineConfig(({ command }) => ({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}))
