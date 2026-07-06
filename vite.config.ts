import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      // Vendor code is split below; the remaining first-party app shell is just over
      // Vite's generic 500 kB default, so keep the warning threshold aligned to the
      // actual app bundle instead of forcing circular source chunks.
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
              return 'vendor-react';
            }
            if (id.includes('/@material/web/')) {
              return 'vendor-material';
            }
            if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-vendor/')) {
              return 'vendor-charts';
            }
            if (id.includes('/motion/') || id.includes('/framer-motion/')) {
              return 'vendor-motion';
            }
            if (id.includes('/marked/')) {
              return 'vendor-markdown';
            }
            return 'vendor';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
