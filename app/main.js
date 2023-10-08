
const net = require("net");

console.log("Logs from your program will appear here!");

function extractPath(requestString) {
  const [startLine] = requestString.split('\r\n');
  const [HTTPMethod, path, HTTPVersion] = startLine.split(' ');
  return path;
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const requestPath = extractPath(data.toString().trim());

    let response;
    if (requestPath === '/') {
      response = 'HTTP/1.1 200 OK\r\n\r\n';
    } else {
      response = 'HTTP/1.1 404 Not Found\r\n\r\n';
    }

    socket.write(response, 'utf-8', () => {
      console.log('Response sent, connection closed');
      socket.end();
    });
  });
});

server.listen(4221, "localhost");

