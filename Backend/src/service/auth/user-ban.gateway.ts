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

interface UserCustomerRow {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'active' | 'inactive' | 'banned';
  date_created: string;
  last_updated: string;
}

type BanNotificationPayload = ReturnType<typeof mapBanNotification>;

interface ServerToClientEvents {
  user_ban_notification: (payload: BanNotificationPayload) => void;
}

interface ClientToServerEvents {
  joinUserBanRoom: (data: JoinUserBanDto) => void;
}

interface JoinUserBanDto {
  customerId: string;
}

interface Database {
  public: {
    Tables: {
      user_customer: { Row: UserCustomerRow };
    };
  };
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY ?? '';

function mapBanNotification(row: UserCustomerRow) {
  return {
    customerId: row.customer_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    status: row.status,
    lastUpdated: row.last_updated,
  };
}

@WebSocketGateway({ cors: true })
export class UserBanGateway implements OnGatewayInit, OnGatewayDisconnect {
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
    // Configure Socket.IO to handle multiple listeners from multiple gateways
    this.server.setMaxListeners(50);
    // Set maxListeners on each connecting socket
    this.server.on('connection', (socket) => {
      socket.setMaxListeners(50);
    });
    this.startRealtimeListener();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: Socket): void {
    // Socket.IO auto cleans rooms
  }

  // ─── Join User Ban Room ─────────────────────────────────────

  @SubscribeMessage('joinUserBanRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { customerId }: JoinUserBanDto,
  ): void {
    const room = `user_ban_${customerId}`;

    void client.join(room);

    console.log(`Client joined user ban room: ${room}`);
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
      .channel('user-ban-changes')
      .on<UserCustomerRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_customer',
        },

        ({ new: newRow }) => {
          if (!newRow.customer_id) return;

          try {
            // Only emit if status is banned
            if (newRow.status !== 'banned') {
              return;
            }

            const payload = mapBanNotification(newRow);

            this.server
              .to(`user_ban_${newRow.customer_id}`)
              .emit('user_ban_notification', payload);

            console.log(
              `🚫 Ban notification sent to user ${newRow.customer_id}`,
            );
          } catch (err) {
            console.error('Realtime processing error:', err);
          }
        },
      )
      .subscribe((status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Connected to Supabase User Ban Realtime');
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
    console.log('Cleaning up Supabase User Ban Realtime connections...');
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
