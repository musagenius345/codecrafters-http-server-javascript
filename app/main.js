const fs = require('fs');
const net = require('net');
const path = require('path');

console.log('Logs from your program will appear here!');

const server = net.createServer((socket) => {
  let requestData = '';

  socket.on('data', (data) => {
    requestData += data.toString();

    // Check if the request data includes the end of a POST request header
    if (requestData.includes('\r\n\r\n')) {
      const [headers, body] = requestData.split('\r\n\r\n');
      const [startLine, ...headerLines] = headers.split('\r\n');
      const [, method, path] = startLine.split(' ');

      if (method === 'POST' && path.startsWith('/files/')) {
        const directory = process.argv[3];
        const filename = path.split('/files/')[1];
        const filePath = path.join(directory, filename);

        // Save the POST body (file content) to the specified file
        fs.writeFileSync(filePath, body);

        // Send a 201 Created response
        const response = 'HTTP/1.1 201 Created\r\nContent-Length: 0\r\n\r\n';
        socket.write(response, 'utf-8', () => {
          console.log('File created, 201 response sent, connection closed');
          socket.end();
        });
      } else {
        // Handle other request types here if needed
        // ...

        // Send a 404 Not Found response for unsupported routes
        const notFoundResponse = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 9\r\n\r\nNot Found';
        socket.write(notFoundResponse, 'utf-8', () => {
          console.log('Path not found, 404 response sent, connection closed');
          socket.end();
        });
      }
    }
  });

  socket.on('close', () => {
    console.log('Connection closed');
  });
});

server.listen(4221, 'localhost');
