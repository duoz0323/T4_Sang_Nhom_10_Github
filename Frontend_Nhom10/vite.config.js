import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Các đoạn mã từ thư viện bên thứ ba (vendor)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['sonner', 'lucide-react'],
          'vendor-utils': ['axios'],
        }
      }
    },
    chunkSizeWarningLimit: 600 // Tăng giới hạn cảnh báo
  },
  
  // Phân giải chính xác các tài nguyên tĩnh
  publicDir: 'public',
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg']
})
