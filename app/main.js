
const net = require('net');

console.log('Logs from your program will appear here!');

function extractPath(requestString) {
  const [startLine] = requestString.split('\r\n');
  const [, path] = startLine.split(' ');
  return path;
}

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const path = extractPath(data.toString().trim());

    let response;
    if (path === '/') {
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
});

server.listen(4221, 'localhost');

