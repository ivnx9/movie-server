const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://exam-miner.com",
  "http://exam-miner.com",
  "https://www.exam-miner.com",
  "http://www.exam-miner.com"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
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
