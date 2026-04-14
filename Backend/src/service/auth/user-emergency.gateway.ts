import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
  REALTIME_SUBSCRIBE_STATES,
} from '@supabase/supabase-js';
import { Server, Socket } from 'socket.io';
import ws from 'ws';

(global as typeof globalThis & { WebSocket: any }).WebSocket = ws;

interface EmergencyRow {
  id: string;
  machine_id: string;
  is_active: boolean;
  date_created: string;
}

type EmergencyNotificationPayload = ReturnType<typeof mapEmergencyNotification>;

interface ServerToClientEvents {
  emergency_notification: (payload: EmergencyNotificationPayload) => void;
}

interface ClientToServerEvents {
  joinEmergencyRoom: (data: JoinEmergencyDto) => void;
}

interface JoinEmergencyDto {
  machineId: string;
}

interface Database {
  public: {
    Tables: {
      emergency: { Row: EmergencyRow };
    };
  };
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY ?? '';

function mapEmergencyNotification(row: EmergencyRow) {
  return {
    id: row.id,
    machineId: row.machine_id,
    isActive: row.is_active,
    dateCreated: row.date_created,
  };
}

@WebSocketGateway({ cors: true })
export class UserEmergencyGateway
  implements OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly supabase: SupabaseClient<Database>;
  private channel: RealtimeChannel | null = null;
  private isReconnecting = false;

  constructor() {
    this.supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      realtime: {
        params: { eventsPerSecond: 10 },
        heartbeatIntervalMs: 15000,
      },
    });
  }

  afterInit(): void {
    this.startRealtimeListener();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: Socket): void {
    // Socket.IO auto cleans rooms
  }

  // ─── Join Emergency Room ─────────────────────────────────────

  @SubscribeMessage('joinEmergencyRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { machineId }: JoinEmergencyDto,
  ): void {
    const room = `emergency_${machineId}`;

    void client.join(room);

    console.log(`Client joined emergency room: ${room}`);
  }

  // ─── Supabase Listener ─────────────────────────────────────

  private async startRealtimeListener(): Promise<void> {
    // Prevent multiple simultaneous reconnection attempts
    if (this.isReconnecting) {
      return;
    }

    // Clean up existing channel before creating a new one
    if (this.channel) {
      try {
        await this.supabase.removeChannel(this.channel);
        this.channel = null;
      } catch (err) {
        console.error('Error removing old channel:', err);
      }
    }

    this.channel = this.supabase
      .channel('emergency-changes')
      .on<EmergencyRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency',
        },

        ({ new: newRow }) => {
          if (!newRow.machine_id) return;

          try {
            // Only emit if is_active is true
            if (!newRow.is_active) {
              return;
            }

            const payload = mapEmergencyNotification(newRow);

            this.server
              .to(`emergency_${newRow.machine_id}`)
              .emit('emergency_notification', payload);

            console.log(
              `🚨 Emergency notification sent for machine ${newRow.machine_id}`,
            );
          } catch (err) {
            console.error('Realtime processing error:', err);
          }
        },
      )
      .subscribe((status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Connected to Supabase Emergency Realtime');
          this.isReconnecting = false;
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          console.error('❌ Supabase TIMED_OUT. Reconnecting...');
          this.isReconnecting = true;
          setTimeout(() => {
            void this.startRealtimeListener();
          }, 5000);
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error(
            '❌ Channel Error. Ensure Realtime is enabled in Supabase.',
          );
        }
      });
  }

  async onModuleDestroy(): Promise<void> {
    console.log('Cleaning up Supabase Emergency Realtime connections...');
    if (this.channel) {
      try {
        await this.supabase.removeChannel(this.channel);
        this.channel = null;
      } catch (err) {
        console.error('Error removing channel during cleanup:', err);
      }
    }
    await this.supabase.removeAllChannels();
  }
}
