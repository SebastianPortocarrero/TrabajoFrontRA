const http = require('http');

console.log('Testing connection to http://localhost:3002/api/auth/sign-in/email...');

// Test auth endpoint
const postData = JSON.stringify({
  email: 'test@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/auth/sign-in/email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Body:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('Auth endpoint test completed');
  });
}).on('error', (err) => {
  console.log('Connection error:', err.message);
}).setTimeout(5000, () => {
  console.log('Connection timeout');
  req.destroy();
});

req.write(postData);
req.end();