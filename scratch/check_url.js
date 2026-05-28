const http = require('https');

function checkImage(url) {
  http.get(url, (res) => {
    console.log(`URL: ${url}`);
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);
    console.log('-----------------------------------------');
  }).on('error', (e) => {
    console.error(`Error for ${url}:`, e.message);
  });
}

checkImage('https://boox-store.vercel.app/images/anker-zolo-30w-new-1.jpg');
checkImage('https://boox-store.vercel.app/images/anker-zolo-30w-new-2.jpg');
checkImage('https://boox-store.vercel.app/images/anker-zolo-30w-new-3.jpg');
checkImage('https://boox-store.vercel.app/images/apple-35w-charger-1.png');
checkImage('https://boox-store.vercel.app/images/apple-35w-charger-2.png');
checkImage('https://boox-store.vercel.app/images/iphone-11-pro-gold-1.webp');
checkImage('https://boox-store.vercel.app/images/iphone-11-pro-gold-2.png');
checkImage('https://boox-store.vercel.app/products/anker-zolo-30w-charger-usb-c');
checkImage('https://boox-store.vercel.app/products/apple-35w-dual-port-charger-usb-c');
checkImage('https://boox-store.vercel.app/products/iphone-11-pro-gold-82');
