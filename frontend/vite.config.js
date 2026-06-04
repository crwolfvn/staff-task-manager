import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({

  // KHÔNG Sử dụng CNAME
  //base: '/staff-task-manager/',

  // Sử dụng CNAME
  base: '/',

  
  plugins: [react()],
})