import { defineConfig } from 'vite'

const isPreview = process.argv.some(arg => arg.includes('preview'))

export default defineConfig(({ command }) => ({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: command === 'build' ? false : true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: command === 'build',
        drop_debugger: command === 'build'
      }
    },
    rollupOptions: {
      input: {
        main: 'index.html',
        work: 'work.html',
        about: 'about.html',
        musings: 'musings.html',
        'work/index': 'work/index.html',
        'about/index': 'about/index.html',
        'musings/index': 'musings/index.html'
      },
      output: {
        manualChunks: {
          vendor: ['sharp'],
          modules: [
            './src/cursor.js',
            './src/draggable.js'
          ]
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: true,
    port: 5173,
    open: '/',
    strictPort: false,
    cors: true,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false,
      interval: 100
    }
  },
  preview: {
    host: true,
    port: 4173
  },
  optimizeDeps: {
    include: ['sharp']
  }
}))
