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
  private machineRooms = new Map<string, Set<string>>(); // machineId -> Set of client IDs

  constructor(private readonly databaseService: DatabaseService) {}

  handleConnection(client: Socket) {
    const { machineId, customerId } = client.handshake.auth || {};
    console.log(
      `[VideoStream] Client connected: ${client.id}, machineId: ${machineId}, customerId: ${customerId}`,
    );

    if (machineId) {
      // Join a room based on machineId
      const roomName = `machine:${machineId}`;
      client.join(roomName);
      console.log(`[VideoStream] Client ${client.id} joined room: ${roomName}`);

      // Track clients per machine
      if (!this.machineRooms.has(machineId)) {
        this.machineRooms.set(machineId, new Set());
      }
      this.machineRooms.get(machineId)?.add(client.id);

      // Check if this machine has active producers
      const hasProducer = Array.from(this.producers).some((producerId) => {
        const producerSocket = this.server.sockets.sockets.get(producerId);
        return producerSocket?.handshake.auth?.machineId === machineId;
      });

      client.emit('stream-status', { active: hasProducer });
      console.log(
        `[VideoStream] Initial status sent to ${client.id}: ${hasProducer}`,
      );
    }
  }

  handleDisconnect(client: Socket) {
    const { machineId } = client.handshake.auth || {};
    console.log(
      `[VideoStream] Client disconnected: ${client.id}, machineId: ${machineId}`,
    );

    // Remove from machine room tracking
    if (machineId && this.machineRooms.has(machineId)) {
      const machineRoom = this.machineRooms.get(machineId);
      if (machineRoom) {
        machineRoom.delete(client.id);
        if (machineRoom.size === 0) {
          this.machineRooms.delete(machineId);
        }
      }
    }

    // Handle producer disconnect
    if (this.producers.has(client.id)) {
      this.producers.delete(client.id);
      console.log(
        `[VideoStream] Producer removed: ${client.id}. Remaining: ${this.producers.size}`,
      );

      // Notify only the affected machine's room
      if (machineId) {
        const roomName = `machine:${machineId}`;
        const hasOtherProducers = Array.from(this.producers).some(
          (producerId) => {
            const producerSocket = this.server.sockets.sockets.get(producerId);
            return producerSocket?.handshake.auth?.machineId === machineId;
          },
        );

        if (!hasOtherProducers) {
          this.server.to(roomName).emit('stream-status', { active: false });
          console.log(
            `[VideoStream] No producers for machine ${machineId}, status emitted: active=false`,
          );
        }
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

    const { machineId } = client.handshake.auth || {};
    if (!machineId) {
      console.error(
        `[VideoStream] video-frame from ${client.id} has no machineId`,
      );
      return;
    }

    if (!this.producers.has(client.id)) {
      console.log(
        `[VideoStream] New producer identified: ${client.id} for machine: ${machineId}`,
      );
      this.producers.add(client.id);

      // Notify only clients watching this specific machine
      const roomName = `machine:${machineId}`;
      this.server.to(roomName).emit('stream-status', { active: true });
      console.log(
        `[VideoStream] Producer added for ${machineId}, status emitted: active=true`,
      );
    }

    // Broadcast the video frame ONLY to clients in the same machine room (except sender)
    const roomName = `machine:${machineId}`;
    client.to(roomName).emit('stream', data);
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

    // Broadcast to users watching this specific machine
    const roomName = `machine:${data.machineId}`;
    client.to(roomName).emit('detection-update', data);

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
