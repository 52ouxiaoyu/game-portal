export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('Missing url');
  }

  try {
    const fetchRes = await fetch(url, {
      headers: {
        'User-Agent': 'okhttp/4.12.0'
      }
    });
    const arrayBuffer = await fetchRes.arrayBuffer();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'application/json');
    
    res.status(fetchRes.status).send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).send(err.message);
  }
}
