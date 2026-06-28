import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import http from 'http'
import https from 'https'

export default defineConfig({
  base: './', // Use relative paths for assets
  build: {
    outDir: '../tvbox',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    {
      name: 'cors-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy', (req, res) => {
          try {
            const urlStr = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('url')
            if (!urlStr) {
              res.statusCode = 400
              res.end('Missing url')
              return
            }
            const protocol = urlStr.startsWith('https') ? https : http
            
            protocol.get(urlStr, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            }, (proxyRes) => {
              res.writeHead(proxyRes.statusCode || 200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': proxyRes.headers['content-type'] || 'application/json'
              })
              proxyRes.pipe(res)
            }).on('error', (e) => {
              res.statusCode = 500
              res.end(e.message)
            })
          } catch(e: any) {
            res.statusCode = 500
            res.end(e.message)
          }
        })
      }
    }
  ],
})
