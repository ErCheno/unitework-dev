// socket-server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const SERVER = 'localhost';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `http://${SERVER}:5173`,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id);

  socket.on('nuevoWorkspace', (data) => {
    console.log('Nuevo workspace recibido:', data);
    socket.broadcast.emit('getWorkspaces', data); // Envía a todos menos al emisor
  });

  socket.on("nueva-invitacion", (data) => {
    console.log("📨 Nueva invitación emitida:", data);
  });  


  socket.on("recibir-invitacion", (payload) => {
    console.log("Nueva invitación recibida:", payload);
    getInvitations();
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id);
  });
});

server.listen(3001, () => {
  console.log(`✅ Socket server corriendo en http://${SERVER}:3001`);
});
