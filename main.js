const net = require('net');
const fs = require('fs').promises;
const path = require('path');

console.log('Logs from your program will appear here!');

function extractPath(requestString) {
  const [startLine, ...headers] = requestString.split('\r\n');
  const [, path] = startLine.split(' ');
  return path;
}

const server = net.createServer((socket) => {
  socket.on('data', async (data) => {
    const requestPath = extractPath(data.toString().trim());

    if (requestPath.startsWith('/files/')) {
      const fileName = requestPath.substring('/files/'.length);
      const directoryPath = process.argv[3]; // Get directory path from command line argument

      try {
        const filePath = path.join(directoryPath, fileName);
        const fileContent = await fs.readFile(filePath);
        const contentLength = fileContent.length;

        socket.write(`HTTP/1.1 200 OK\r\n`);
        socket.write(`Content-Type: application/octet-stream\r\n`);
        socket.write(`Content-Length: ${contentLength}\r\n\r\n`);
        socket.write(fileContent);
      } catch (error) {
        // File not found, return 404 response
        socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
      }
    } else {
      // Handle other types of requests (e.g., user-agent, echo)
      // ... (same as the original code)
    }

    socket.end();
  });

  socket.on('close', () => {
    console.log('Connection closed');
  });
});

server.listen(4221, 'localhost');
