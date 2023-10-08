
const net = require("net");

console.log("Logs from your program will appear here!");

function extractPath(requestString) {
  const [startLine] = requestString.split('\r\n');
  const [HTTPMethod, path, HTTPVersion] = startLine.split(' ');
  return path;
}

function extractEndpoint(path){
  const parts =  path.split('/')
  return parts[2] || ''
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const requestPath = extractPath(data.toString().trim());
    const endPoint = extractEndpoint(requestPath)

    let response;
    if (endPoint) {
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${endPoint.length}\r\n\r\n${endPoint}`;
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

