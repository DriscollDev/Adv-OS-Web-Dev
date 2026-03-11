import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  // Register Svelte support so Vite can compile .svelte components.
  plugins: [svelte()],
})
