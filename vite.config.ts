import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Em desenvolvimento, /api vai para a API do gerenciador de licenças (a avaliação é pedida a ela).
// Em produção, o actusprot-web (Caddy, ACTUSProt_API/deploy) faz o mesmo no domínio do site.
// O gerenciador atende três produtos: o proxy marca as chamadas com X-Produto: actusprot.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    server: {
      // SITE_PORTA no .env.local; strictPort: se a porta estiver ocupada, avisa em vez de pular para outra
      port: Number(env.SITE_PORTA) || 5201,
      strictPort: true,
      proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:3100', rewrite: (p) => p.replace(/^\/api/, ''), headers: { 'X-Produto': 'actusprot' } } },
    },
  }
})
