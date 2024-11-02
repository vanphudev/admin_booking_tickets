import path from 'path';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd(), '');
   const base = env.VITE_APP_BASE_PATH || '/';
   const isProduction = mode === 'production';

   return {
      base,
      plugins: [
         react(),
         tsconfigPaths(),
         createSvgIconsPlugin({
            iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
            symbolId: 'icon-[dir]-[name]',
         }),
         isProduction &&
            visualizer({
               open: true,
               gzipSize: true,
               brotliSize: true,
            }),
      ],
      server: {
         open: true,
         host: true,
         port: 1111,
         proxy: {
            '/api': {
               target: 'http://localhost:1111',
               changeOrigin: true,
               rewrite: (path) => path.replace(/^\/api/, ''),
            },
         },
      },
      optimizeDeps: {
         include: ['react', 'react-dom', 'react-router-dom', 'antd'],
      },
      esbuild: {
         drop: isProduction ? ['console', 'debugger'] : [],
      },
      build: {
         target: 'esnext',
         minify: 'esbuild',
         sourcemap: false,
         cssCodeSplit: true,
         chunkSizeWarningLimit: 1000,
         rollupOptions: {
            output: {
               manualChunks: {
                  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                  'vendor-antd': ['antd', '@ant-design/icons', '@ant-design/cssinjs'],
                  'vendor-charts': ['apexcharts', 'react-apexcharts'],
                  'vendor-utils': ['axios', 'dayjs', 'i18next', 'zustand'],
                  'vendor-ui': ['framer-motion', 'styled-components', '@iconify/react'],
               },
            },
         },
      },
   };
});
