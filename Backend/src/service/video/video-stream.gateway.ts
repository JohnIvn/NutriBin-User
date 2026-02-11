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

  constructor(private readonly databaseService: DatabaseService) {}

  private machineProducers = new Map<string, Set<string>>();

  async handleConnection(client: Socket) {
    const machineId =
      client.handshake.auth.machineId || client.handshake.query.machineId;
    const customerId =
      client.handshake.auth.customerId || client.handshake.query.customerId;

    console.log(
      `[VideoStream] Connection attempt: client=${client.id}, machineId=${machineId}, customerId=${customerId}`,
    );

    if (!machineId) {
      console.warn(
        `[VideoStream] Client ${client.id} connected without machineId. Disconnecting.`,
      );
      client.disconnect();
      return;
    }

    // If customerId is provided, it's a user watching - check ownership
    if (customerId) {
      try {
        const query =
          'SELECT 1 FROM machines WHERE machine_id = $1 AND customer_id = $2';
        const result = await this.databaseService
          .getClient()
          .query(query, [machineId, customerId]);

        if (result.rowCount === 0) {
          console.warn(
            `[VideoStream] Unauthorized: User ${customerId} does not own machine ${machineId}`,
          );
          client.disconnect();
          return;
        }
      } catch (error) {
        console.error(`[VideoStream] Error checking machine ownership:`, error);
        client.disconnect();
        return;
      }
    }

    // Join the specific room for this machine
    const roomName = `machine:${machineId}`;
    await client.join(roomName);
    console.log(`[VideoStream] Client ${client.id} joined room ${roomName}`);

    // Send initial status for this specific machine
    const producers = this.machineProducers.get(machineId as string);
    const isActive = producers ? producers.size > 0 : false;
    client.emit('stream-status', { active: isActive });
  }

  handleDisconnect(client: Socket) {
    console.log(`[VideoStream] Client disconnected: ${client.id}`);

    // Clean up producer status across all machines
    for (const [machineId, producers] of this.machineProducers.entries()) {
      if (producers.has(client.id)) {
        producers.delete(client.id);
        console.log(
          `[VideoStream] Producer removed from machine ${machineId}: ${client.id}`,
        );

        if (producers.size === 0) {
          this.server
            .to(`machine:${machineId}`)
            .emit('stream-status', { active: false });
        }
      }
    }
  }

  @SubscribeMessage('video-frame')
  handleVideoFrame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const machineId =
      client.handshake.auth.machineId || client.handshake.query.machineId;

    if (!machineId) {
      console.error(
        '[VideoStream] Received video-frame but no machineId found for client',
        client.id,
      );
      return;
    }

    // Mark as producer for this machine
    let producers = this.machineProducers.get(machineId as string);
    if (!producers) {
      producers = new Set();
      this.machineProducers.set(machineId as string, producers);
    }

    if (!producers.has(client.id)) {
      producers.add(client.id);
      this.server
        .to(`machine:${machineId as string}`)
        .emit('stream-status', { active: true });
      console.log(
        `[VideoStream] Machine ${machineId} started streaming: ${client.id}`,
      );
    }

    // Broadcast frame ONLY to observers in this machine's room
    client.to(`machine:${machineId as string}`).emit('stream', data);
  }
}
