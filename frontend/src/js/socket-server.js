// socket-server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { verificarToken } from './auth.js';

const SERVER = 'localhost';
const PORT = 3001;

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `http://${SERVER}:5173`,
    methods: ['GET', 'POST']
  }
});

// ⬇️ Mapa para guardar qué socket está conectado por cada usuario
const usuarioSockets = new Map();

// Middleware para verificar token
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No hay token'));

  try {
    const usuarioId = await verificarToken(token);
    if (!usuarioId) return next(new Error('Token inválido'));
    socket.usuarioId = usuarioId;
    next();
  } catch (err) {
    next(new Error('Autenticación fallida'));
  }
});

io.on('connection', (socket) => {
  const usuarioId = socket.usuarioId;

  // Guardar el socket del usuario
  usuarioSockets.set(usuarioId.id, socket.id);
  console.log(`🟢 Usuario ${usuarioId.id} conectado: ${socket.id}`);

  socket.emit('usuario-conectado', usuarioId);

  socket.on('nuevoWorkspace', (data) => {
    console.log('Nuevo workspace:', data);
    socket.broadcast.emit('getWorkspaces', data);
  });

  socket.on('nueva-invitacion', async (data) => {
    const destinoId = data.id;
    console.log(destinoId);
    console.log(data);
    const socketDestinoId = usuarioSockets.get(destinoId);

    if (socketDestinoId) {
      const socketDestino = io.sockets.sockets.get(socketDestinoId);
      if (socketDestino) {
        // Aquí emites el evento para que el cliente reciba la invitación
        console.log('📨 Invitación recibida vía socket:', data);
        socketDestino.emit("nueva-invitacion", data);  // Asegúrate de pasar toda la data que necesitas
      }
    } else {
      console.log('El usuario destino no está conectado.');
    }
  });

  socket.on('customDisconnect', () => {
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Usuario ${usuarioId} desconectado`);
    usuarioSockets.delete(usuarioId);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Socket server corriendo en http://${SERVER}:${PORT}`);
});
