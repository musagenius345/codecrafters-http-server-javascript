const fs = require('fs');
const net = require('net');
const path = require('path');

console.log('Logs from your program will appear here!');

function extractPathAndUserAgent(requestString) {
  const [startLine, ...headers] = requestString.split('\r\n');
  const [, path] = startLine.split(' ');
  const userAgentLine = headers.find((line) => line.startsWith('User-Agent: '));
  const userAgent = userAgentLine ? userAgentLine.split(' ')[1] : '';
  return { path, userAgent };
}

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const { path, userAgent } = extractPathAndUserAgent(data.toString().trim());

    if (path.startsWith('/files/')) {
      const filePath = path.substring('/files/'.length);
      const absolutePath = path.join(__dirname, filePath); // Constructing absolute path using path module
      if (fs.existsSync(absolutePath)) {
        const fileContent = fs.readFileSync(absolutePath);
        response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
      } else {
        response = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 9\r\n\r\nNot Found';
      }
    } else if (path === '/user-agent') {
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
    } else if (path === '/') {
      response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 3\r\n\r\nabc';
    } else if (path.startsWith('/echo/')) {
      const randomString = path.substring('/echo/'.length);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n${randomString}`;
    } else {
      response = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 9\r\n\r\nNot Found';
    }

    socket.write(response, 'utf-8', () => {
      console.log('Response sent, connection closed');
      socket.end();
    });
  });

  socket.on('close', () => {
    console.log('Connection closed');
  });
});

server.listen(4221, 'localhost');
