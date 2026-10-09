const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });
  socket.on('signal', ({ roomId, signal, to }) => {
    io.to(to).emit('signal', { signal, from: socket.id });
  });
  socket.on('ai-note', ({ roomId, note }) => {
    io.to(roomId).emit('ai-note', note);
  });
});
server.listen(5000, () => {
  console.log('SERVER RUNNING ON http://localhost:5000');
});
