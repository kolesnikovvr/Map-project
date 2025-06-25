import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // чтобы import 'leaflet/dist/leaflet.css' работал
  resolve: {
    alias: {
      '/node_modules/leaflet/dist/': 'leaflet/dist/',
    },
  },
});
