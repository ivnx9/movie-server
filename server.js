const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on("connection", socket => {
  socket.on("join-tv", session => {
    socket.join("tv-" + session);
    socket.data.session = session;
    socket.data.type = "tv";
  });

  socket.on("join-remote", session => {
    socket.join("remote-" + session);
    socket.data.session = session;
    socket.data.type = "remote";

    io.to("tv-" + session).emit("remote-connected");
  });

  socket.on("remote-command", data => {
    if (!data.session || !data.command) return;

    io.to("tv-" + data.session).emit("remote-command", data.command);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Ivan Movies running on port " + PORT);
});
