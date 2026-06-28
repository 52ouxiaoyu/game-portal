const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 8080;
const PUBLIC_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/proxy?url=')) {
    const targetUrl = new URL(req.url, `http://${req.headers.host}`).searchParams.get('url');
    if (!targetUrl) {
      res.writeHead(400);
      return res.end('Missing url');
    }
    const client = targetUrl.startsWith('https') ? https : http;
    client.get(targetUrl, {
      headers: { 'User-Agent': 'okhttp/4.12.0' }
    }, (proxyRes) => {
      if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
        const redirectUrl = new URL(proxyRes.headers.location, targetUrl).toString();
        const redClient = redirectUrl.startsWith('https') ? https : http;
        redClient.get(redirectUrl, {
           headers: { 'User-Agent': 'okhttp/4.12.0' }
        }, (redRes) => {
           res.writeHead(redRes.statusCode, {
             'Access-Control-Allow-Origin': '*',
             'Content-Type': redRes.headers['content-type'] || 'application/json'
           });
           redRes.pipe(res);
        }).on('error', (err) => {
           res.writeHead(500);
           res.end(err.message);
        });
        return;
      }
      res.writeHead(proxyRes.statusCode, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': proxyRes.headers['content-type'] || 'application/json'
      });
      proxyRes.pipe(res);
    }).on('error', (err) => {
      res.writeHead(500);
      res.end(err.message);
    });
    return;
  }
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const extname = String(path.extname(filePath)).toLowerCase();
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('404 Not Found');
  }
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => console.log(`Local TVBox Server running at http://localhost:${PORT}`));
