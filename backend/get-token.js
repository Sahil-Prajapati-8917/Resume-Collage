const http = require('http');

const data = JSON.stringify({
    email: 'testuser@example.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            if (json.token) {
                console.log(json.token);
            } else {
                console.error('Login failed:', json);
            }
        } catch (e) {
            console.error('Failed to parse response:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('Error logging in:', error.message);
});

req.write(data);
req.end();

