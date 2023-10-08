const net = require('net');
const fs = require('fs').promises;
const pathModule = require('path');

console.log('Logs from your program will appear here!');

function extractPath(requestString) {
  const [startLine] = requestString.split('\r\n');
  const [, path] = startLine.split(' ');
  return path;
}

async function serveFile(socket, filePath) {
  try {
    const fileContent = await fs.readFile(filePath);
    const contentLength = fileContent.length;

    socket.write(`HTTP/1.1 200 OK\r\n`);
    socket.write(`Content-Type: application/octet-stream\r\n`);
    socket.write(`Content-Length: ${contentLength}\r\n\r\n`);
    socket.write(fileContent, () => {
      console.log('Response sent, connection closed');
      socket.end();
    });
  } catch (error) {
    console.error(error);
    socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
    socket.end();
  }
}

const server = net.createServer((socket) => {
  socket.on('data', async (data) => {
    const path = extractPath(data.toString().trim());
    const basePath = '<directory>'; // Replace '<directory>' with the actual directory path

    if (path.startsWith('/files/')) {
      const requestedFile = pathModule.join(basePath, path.substring('/files/'.length));

      // Check if the requested file exists in the specified directory
      try {
        const stats = await fs.stat(requestedFile);
        if (stats.isFile()) {
          // Serve the file content as response
          await serveFile(socket, requestedFile);
          return;
        }
      } catch (error) {
        console.error(error);
      }
    }

    // If the requested file doesn't exist or invalid path, return a 404 response
    socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
    socket.end();
  });
});

server.listen(4221, 'localhost');
