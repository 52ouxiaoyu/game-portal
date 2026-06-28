import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  build: {
    outDir: '../tvbox',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    {
      name: 'cors-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res) => {
          try {
            const urlStr = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('url')
            if (!urlStr) {
              res.statusCode = 400
              res.end('Missing url')
              return
            }
            
            const fetchRes = await fetch(urlStr, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              redirect: 'follow'
            })
            
            const arrayBuffer = await fetchRes.arrayBuffer()
            
            res.writeHead(fetchRes.status, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Content-Type': fetchRes.headers.get('content-type') || 'application/json'
            })
            res.end(Buffer.from(arrayBuffer))
          } catch(e: any) {
            res.statusCode = 500
            res.end(e.message)
          }
        })
      }
    }
  ],
})
