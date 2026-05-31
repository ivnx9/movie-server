const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Ivan Movies Remote Server is running.");
});

io.on("connection", socket => {
  console.log("Connected:", socket.id);

  socket.on("join-tv", session => {
    socket.join("tv-" + session);
    console.log("TV joined:", session);
  });

  socket.on("join-remote", session => {
    socket.join("remote-" + session);
    console.log("Remote joined:", session);

    io.to("tv-" + session).emit("remote-connected");
  });

  socket.on("remote-command", data => {
    if (!data.session || !data.command) return;

    io.to("tv-" + data.session).emit("remote-command", data.command);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
