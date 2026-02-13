import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MachineNotificationsGateway {
  @WebSocketServer()
  server: Server;

  // Test message
  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: string) {
    console.log('Received ping:', data);
    return 'pong';
  }
}
