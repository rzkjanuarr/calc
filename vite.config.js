import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' supaya hasil build bisa dibuka dari folder mana pun / hosting statis.
export default defineConfig({
  base: './',
  plugins: [react()],
})
