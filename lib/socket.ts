import { io, Socket } from 'socket.io-client';
import { API_BASE, getToken } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  // Ojo: solo creamos una conexión nueva si no existe ninguna instancia — socket.io
  // ya maneja reconexión internamente (autoConnect/reconnection), así que revisar
  // `.connected` aquí creaba una segunda conexión "huérfana" mientras la primera
  // seguía haciendo el handshake, dejando listeners atados al socket abandonado.
  if (!socket) {
    socket = io(API_BASE, {
      auth: { token: getToken() },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
