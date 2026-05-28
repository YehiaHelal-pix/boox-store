const http = require('https');

http.get('https://boox-store.vercel.app/api/products/iphone-11-pro-gold-82', (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const p = JSON.parse(body);
      console.log('API Product fetched:', p);
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Body:', body);
    }
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
