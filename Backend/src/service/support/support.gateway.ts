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

// ─── Domain Types ────────────────────────────────────────────────────────────

interface SupportTicket {
  ticket_id: string;
  customer_id: string;
  subject: string;
  status: string;
  last_updated: Date;
}

interface SupportMessage {
  message_id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  date_sent: Date;
}

// Payload shapes emitted to the client
type NewMessagePayload = SupportMessage;
type TicketStatusPayload = SupportTicket;

// Typed map of server-to-client events
interface ServerToClientEvents {
  new_message_received: (payload: NewMessagePayload) => void;
  ticket_status_updated: (payload: TicketStatusPayload) => void;
}

// Typed map of client-to-server events
interface ClientToServerEvents {
  joinTicket: (data: JoinTicketDto) => void;
}

// Inbound message body for joinTicket
interface JoinTicketDto {
  ticketId: string;
}

// ─── Supabase Database Schema (minimal, extend as needed) ────────────────────

interface Database {
  public: {
    Tables: {
      support_messages: { Row: SupportMessage };
      support_tickets: { Row: SupportTicket };
    };
  };
}

// ─── Environment ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY ?? '';

// ─── Gateway ─────────────────────────────────────────────────────────────────

@WebSocketGateway({ cors: true })
export class SupportGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      realtime: {
        params: { eventsPerSecond: 10 },
        // Keeps proxies like Railway's connection alive
        heartbeatIntervalMs: 15_000,
      },
    });
  }

  afterInit(): void {
    this.startSupabaseRealtimeListener();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: Socket): void {
    // Intentionally empty — Socket.IO handles room cleanup automatically.
  }

  // ─── Room Management ───────────────────────────────────────────────────────

  @SubscribeMessage('joinTicket')
  handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() { ticketId }: JoinTicketDto,
  ): void {
    const room = `ticket_${ticketId}`;
    void client.join(room);
    console.log(`User joined room: ${room}`);
  }

  // ─── Supabase Realtime ─────────────────────────────────────────────────────

  private startSupabaseRealtimeListener(): void {
    const channel: RealtimeChannel = this.supabase
      .channel('support-system-changes')
      // 1. New support messages
      .on<SupportMessage>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        ({ new: newMessage }) => {
          console.log('New message detected:', newMessage.message_id);
          this.server
            .to(`ticket_${newMessage.ticket_id}`)
            .emit('new_message_received', newMessage);
        },
      )
      // 2. Ticket status / priority updates
      .on<SupportTicket>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_tickets' },
        ({ new: updatedTicket }) => {
          console.log('Ticket update detected:', updatedTicket.ticket_id);
          this.server
            .to(`ticket_${updatedTicket.ticket_id}`)
            .emit('ticket_status_updated', updatedTicket);
        },
      )
      .subscribe((status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Connected to Supabase Realtime');
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          console.error('❌ Supabase TIMED_OUT. Cleaning up...');
          void this.supabase.removeChannel(channel).then(() => {
            setTimeout(() => this.startSupabaseRealtimeListener(), 5_000);
          });
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error(
            '❌ Channel Error. Check if Realtime is enabled in Supabase Dashboard.',
          );
        }
      });

    // Warn on heartbeat timeouts — indicates an unstable network
    this.supabase.realtime.onHeartbeat((hbStatus) => {
      if (hbStatus === 'timeout') {
        console.warn('⚠️ Heartbeat timeout detected. Network may be unstable.');
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    console.log('Cleaning up Supabase Realtime connections...');
    await this.supabase.removeAllChannels();
  }
}
