import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages用の設定（リポジトリ名に応じて変更）
  // 例: https://username.github.io/realtime-map/ の場合
  base: process.env.NODE_ENV === 'production' ? '/realtime-map/' : '/',
})
