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
        main: 'pages/index.html',
        work: 'pages/work.html',
        about: 'pages/about.html',
        musings: 'pages/musings.html'
      },
      output: {
        manualChunks: {
          vendor: ['sharp'],
          modules: [
            './src/modules/DraggableBoxes.js',
            './src/modules/CustomCursor.js',
            './src/modules/ImageViewer.js',
            './src/modules/Clock.js',
            './src/modules/Utils.js'
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
          open: false,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
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
