const net = require('net');

console.log('Logs from your program will appear here!');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = data.toString().trim();

    // Check if the request is empty or not a valid GET request
    if (request !== 'GET /files/<filename> HTTP/1.1') {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.end();
      return;
    }

    // Replace '<filename>' with the actual filename to be served
    const filePath = '<directory>/<filename>'; // Replace '<directory>' with the actual directory path
    const statusCode = 200;

    // Respond with HTTP/1.1 200 OK\r\n\r\n
    socket.write(`HTTP/1.1 ${statusCode} OK\r\n\r\n`);
    
    // Read the file asynchronously and send its contents as the response body
    require('fs').readFile(filePath, (err, data) => {
      if (err) {
        console.error(err);
        socket.write('Error reading the file\r\n');
      } else {
        socket.write(data);
      }

      socket.end();
    });
  });

  socket.on('close', () => {
    console.log('Connection closed');
  });
});

server.listen(4221, 'localhost');

