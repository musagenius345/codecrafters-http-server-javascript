const fs = require('fs');
const net = require('net');
const path = require('path'); // Import the path module

console.log('Logs from your program will appear here!');

function extractPathAndUserAgent(requestString) {
  const [startLine, ...headers] = requestString.split('\r\n');
  const [, path] = startLine.split(' ');
  const userAgentLine = headers.find((line) => line.startsWith('User-Agent: '));
  const userAgent = userAgentLine ? userAgentLine.split(' ')[1] : '';
  return { path, userAgent };
}

const server = net.createServer((socket) => {
  let requestBody = '';

  socket.on('data', (data) => {
    requestBody += data.toString();
  });

  socket.on('end', () => {
    const { path: rawPath, userAgent } = extractPathAndUserAgent(requestBody);

    if (rawPath.startsWith('/files/') && rawPath.includes('POST')) {
      const directory = process.argv[3]; // Get the directory from command line arguments
      const filename = rawPath.split('/files/')[1];
      const filePath = path.join(directory, filename);

      // Extract the file content from the request body
      const fileContent = requestBody.split('\r\n\r\n')[1];

      fs.writeFileSync(filePath, fileContent, 'utf-8'); // Save the file content to the specified path

      const createdResponse = 'HTTP/1.1 201 Created\r\nContent-Type: text/plain\r\nContent-Length: 7\r\n\r\nCreated';
      socket.write(createdResponse, 'utf-8', () => {
        console.log('File saved, 201 response sent, connection closed');
        socket.end();
      });
    } else if (rawPath.startsWith('/files/') && !rawPath.includes('POST')) {
      const directory = process.argv[3]; // Get the directory from command line arguments
      const filename = rawPath.split('/files/')[1];
      const filePath = path.join(directory, filename);

      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath);
        const response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
        socket.write(response, 'utf-8', () => {
          console.log('Response sent, connection closed');
          socket.end();
        });
      } else {
        const notFoundResponse = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 9\r\n\r\nNot Found';
        socket.write(notFoundResponse, 'utf-8', () => {
          console.log('File not found, 404 response sent, connection closed');
          socket.end();
        });
      }
    } else if (rawPath === '/user-agent') {
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
      socket.write(response, 'utf-8', () => {
        console.log('Response sent, connection closed');
        socket.end();
      });
    } else if (rawPath === '/') {
      const response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 3\r\n\r\nabc';
      socket.write(response, 'utf-8', () => {
        console.log('Response sent, connection closed');
        socket.end();
      });
    } else if (rawPath.startsWith('/echo/')) {
      const randomString = rawPath.substring('/echo/'.length);
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n${randomString}`;
      socket.write(response, 'utf-8', () => {
        console.log('Response sent, connection closed');
        socket.end();
      });
    } else {
      const notFoundResponse = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 9\r\n\r\nNot Found';
      socket.write(notFoundResponse, 'utf-8', () => {
        console.log('Path not found, 404 response sent, connection closed');
        socket.end();
      });
    }
  });

  socket.on('close', () => {
    console.log('Connection closed');
  });
});

server.listen(4221, 'localhost');
