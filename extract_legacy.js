const fs = require('fs');
const html = fs.readFileSync('legacy/index.html', 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  fs.writeFileSync('legacy/styles.css', styleMatch[1]);
  console.log('CSS extracted. Lines:', styleMatch[1].split('\n').length);
}

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  fs.writeFileSync('legacy/scripts.js', scriptMatch[1]);
  console.log('JS extracted. Lines:', scriptMatch[1].split('\n').length);
}

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (bodyMatch) {
  fs.writeFileSync('legacy/body.html', bodyMatch[1]);
  console.log('Body HTML extracted. Lines:', bodyMatch[1].split('\n').length);
}
