const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

let users = {};

function broadcastUserList() {
  const list = Object.keys(users);
  Object.values(users).forEach(ws => {
    ws.send(JSON.stringify({ type: "users", users: list }));
  });
}

wss.on("connection", ws => {

  ws.on("message", message => {
    const data = JSON.parse(message);

    if (data.type === "register") {
      users[data.username] = ws;
      ws.username = data.username;
      broadcastUserList();
    }

    if (data.type === "signal" && users[data.to]) {
      users[data.to].send(JSON.stringify({
        type: "signal",
        from: ws.username,
        signal: data.signal
      }));
    }

    if (data.type === "message" && users[data.to]) {
      users[data.to].send(JSON.stringify({
        type: "message",
        from: ws.username,
        text: data.text
      }));
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      delete users[ws.username];
      broadcastUserList();
    }
  });

});

console.log("LAN Server running on port 3000");
