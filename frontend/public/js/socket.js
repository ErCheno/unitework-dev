// socket.js (en el frontend, por ejemplo en /public/js/)
import { io } from "socket.io-client";
export const SERVER = 'localhost'; // O reemplaza con la URL de tu servidor
export const socket = io(`http://${SERVER}:3001`); // Debe coincidir con el puerto del backend socket
