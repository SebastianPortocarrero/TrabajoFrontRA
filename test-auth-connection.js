const http = require('http');

console.log('Testing connection to http://localhost:3002...');

// Test basic connection
const req = http.get('http://localhost:3002', (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Body:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('Connection test completed');
  });
}).on('error', (err) => {
  console.log('Connection error:', err.message);
}).setTimeout(5000, () => {
  console.log('Connection timeout');
  req.destroy();
});