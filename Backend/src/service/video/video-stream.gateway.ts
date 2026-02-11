import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../database/database.service';

@WebSocketGateway({
  namespace: 'videostream',
  cors: {
    origin: '*',
  },
})
export class VideoStreamGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private producers = new Set<string>();

  constructor(private readonly databaseService: DatabaseService) {}

  handleConnection(client: Socket) {
    console.log(`[VideoStream] Client connected: ${client.id}`);
    const isActive = this.producers.size > 0;
    client.emit('stream-status', { active: isActive });
    console.log(
      `[VideoStream] Initial status sent to ${client.id}: ${isActive}`,
    );
  }

  handleDisconnect(client: Socket) {
    console.log(`[VideoStream] Client disconnected: ${client.id}`);
    if (this.producers.has(client.id)) {
      this.producers.delete(client.id);
      console.log(
        `[VideoStream] Producer removed: ${client.id}. Remaining: ${this.producers.size}`,
      );
      if (this.producers.size === 0) {
        this.server.emit('stream-status', { active: false });
        console.log(
          '[VideoStream] All producers gone, status emitted: active=false',
        );
      }
    }
  }

  @SubscribeMessage('video-frame')
  handleVideoFrame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    // Mark this client as a producer if not already
    if (!client || !client.id) {
      console.error(
        '[VideoStream] Received video-frame but client is undefined',
      );
      return;
    }

    if (!this.producers.has(client.id)) {
      console.log(`[VideoStream] New producer identified: ${client.id}`);
      this.producers.add(client.id);
      this.server.emit('stream-status', { active: true });
      console.log('[VideoStream] Producer added, status emitted: active=true');
    }

    // Broadcast the video frame to all clients except the sender
    // Using binary data directly
    client.broadcast.emit('stream', data);
  }

  @SubscribeMessage('detection')
  async handleDetection(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      content: string;
      confidence: number;
      timestamp: string;
      machineId: string;
      customerId: string;
    },
  ) {
    console.log(`[VideoStream] Detection received from ${client.id}:`, data);

    // Broadcast to users
    client.broadcast.emit('detection-update', data);

    // Save to database
    const dbClient = this.databaseService.getClient();
    try {
      await dbClient.query(
        `INSERT INTO camera_logs (
          machine_id, 
          customer_id, 
          classification, 
          details
        ) VALUES ($1, $2, $3, $4)`,
        [
          data.machineId,
          data.customerId,
          'large', // Mapping any detection to 'large' as placeholder since classification is ENUM
          `Detected ${data.content} with ${Math.round(data.confidence * 100)}% confidence at ${data.timestamp}`,
        ],
      );
      console.log('[VideoStream] Detection saved to database');
    } catch (error) {
      console.error('[VideoStream] Error saving detection:', error);
    }
  }
}
