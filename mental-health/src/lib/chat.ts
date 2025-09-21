import { io, Socket } from 'socket.io-client';
import { API_URL } from './api';
import { getToken } from './auth';

let socket: Socket | null = null;

export function connectChat(): Socket {
  if (socket?.connected) return socket!;
  
  socket = io(API_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    query: { token: getToken() ?? '' },
  } as any);
  
  socket.on('connect', () => {
    socket!.emit('join_room', { roomId: 'peer-support-1' });
  });
  
  return socket!;
}

export function disconnectChat() {
  socket?.disconnect();
  socket = null;
}