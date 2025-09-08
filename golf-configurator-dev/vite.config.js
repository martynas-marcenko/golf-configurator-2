import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';

export default defineConfig({
  plugins: [preact()],

  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },

  build: {
    outDir: '../golf-configurator/extensions/golf-configurator-theme-app-extention/assets',
    rollupOptions: {
      input: './src/main.jsx',
      output: {
        entryFileNames: 'golf-configurator.bundle.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'golf-configurator.bundle.css';
          }
          return assetInfo.name || 'asset';
        },
        chunkFileNames: 'golf-configurator-[name].js',
      },
    },
    sourcemap: false,
    target: 'es2018',
    minify: 'terser',
    cssMinify: true,
    emptyOutDir: false, // Don't clear the assets directory completely
  },

  css: {
    postcss: './postcss.config.js',
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },

  server: {
    port: 3000,
    open: false,
    cors: true,
    proxy: {
      // Proxy Shopify API calls to your development store
      '/products': {
        target: 'https://march-theme.myshopify.com',
        changeOrigin: true,
        secure: true,
      },
      '/cart': {
        target: 'https://march-theme.myshopify.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
