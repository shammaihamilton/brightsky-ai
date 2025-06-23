import io from 'socket.io-client';

// Set your backend WebSocket URL here
const SOCKET_URL = 'http://localhost:3001'; // Change to your backend URL if needed

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
