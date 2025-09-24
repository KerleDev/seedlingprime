import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'stats.html',   // הקובץ עם הגרף יווצר בתוך dist/
      template: 'treemap',      // יש גם sunburst/other אם תרצי
      open: true,               // יפתח אוטומטית בדפדפן אחרי build
    }),
  ],
  build: {
    chunkSizeWarningLimit: 2000, // מעלה את המגבלה כדי להעלים את האזהרה
  },
})
