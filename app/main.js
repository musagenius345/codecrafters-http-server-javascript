const { log } = require("console");
const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    log(data)

    const response = 'HTTP/1.1 200 OK\r\n\r\n'

    socket.write(response, 'utf-8', () => {
      log('Response sent, connection closed')
    })

    socket.end()
    server.close()
  })

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
