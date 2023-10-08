const fs = require('fs');
const path = require('path');

const net = require('net');

console.log('Logs from your program will appear here!');

const directoryFlagIndex = process.argv.indexOf('--directory');
if (directoryFlagIndex === -1 || !process.argv[directoryFlagIndex + 1]) {
  console.error('Error: Please provide a valid directory path using --directory flag.');
  process.exit(1);
}
const directoryPath = process.argv[directoryFlagIndex + 1];

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const [method, requestPath] = extractMethodAndPath(data.toString().trim());

    if (method === 'GET' && requestPath.startsWith('/files/')) {
      const filename = requestPath.substring('/files/'.length);
      const filePath = path.join(directoryPath, filename);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const fileContent = fs.readFileSync(filePath);
        const contentLength = fileContent.length;

        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${contentLength}\r\n\r\n`
        );
        socket.write(fileContent, () => {
          console.log('Response sent, connection closed');
          socket.end();
        });
      } else {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.end();
      }
    } else {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.end();
    }
  });
});

function extractMethodAndPath(requestString) {
  const [startLine] = requestString.split('\r\n');
  const [method, path] = startLine.split(' ');
  return [method, path];
}

server.listen(4221, 'localhost');
