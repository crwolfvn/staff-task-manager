import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Khi không dùng Customs domain
  // base: '/staff-task-manager/',
  
  // Khi có dùng customs domain
    base: "/",

  
})