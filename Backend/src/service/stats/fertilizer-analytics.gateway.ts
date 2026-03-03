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

interface FertilizerAnalyticsRow {
  fertilizer_analytics_id: string;
  user_id: string;
  machine_id: string | null;
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  temperature: string | null;
  ph: string | null;
  humidity: string | null;
  moisture: string | null;
  methane: string | null;
  air_quality: string | null;
  carbon_monoxide: string | null;
  combustible_gases: string | null;
  weight_kg: string | null;
  reed_switch: string | null;
  date_created: string;
}

// ─── Payload emitted to client ──────────────────────────────────────────────

type FertilizerAnalyticsPayload = ReturnType<typeof mapFertilizerAnalytics>;

// ─── Socket Event Maps ──────────────────────────────────────────────────────

interface ServerToClientEvents {
  fertilizer_analytics_update: (payload: FertilizerAnalyticsPayload) => void;
}

interface ClientToServerEvents {
  joinFertilizerRoom: (data: JoinFertilizerDto) => void;
}

interface JoinFertilizerDto {
  customerId: string;
  machineId?: string;
}

// ─── Supabase Schema ─────────────────────────────────────────────────────────

interface Database {
  public: {
    Tables: {
      fertilizer_analytics: { Row: FertilizerAnalyticsRow };
    };
  };
}

// ─── Environment ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY ?? '';

// ─── Value Mapper (same as controller) ──────────────────────────────────────

function mapFertilizerAnalytics(row: FertilizerAnalyticsRow) {
  const invertValue = (val: any) => {
    if (val === null || val === undefined) return null;
    const isTruthy =
      val === true ||
      val === 1 ||
      String(val).toLowerCase() === 'true' ||
      String(val).toLowerCase() === '1' ||
      String(val).toLowerCase() === 't';
    return !isTruthy;
  };

  return {
    id: row.fertilizer_analytics_id,
    nitrogen: row.nitrogen,
    phosphorus: row.phosphorus,
    potassium: row.potassium,
    temperature: row.temperature,
    ph: row.ph,
    humidity: row.humidity,
    moisture: row.moisture,
    methane: row.methane,
    air_quality: row.air_quality,
    carbon_monoxide: row.carbon_monoxide,
    combustible_gases: row.combustible_gases,
    weight_kg: row.weight_kg,
    reed_switch: invertValue(row.reed_switch),
    date_created: row.date_created,
  };
}

// ─── Gateway ─────────────────────────────────────────────────────────────────

@WebSocketGateway({ cors: true })
export class FertilizerAnalyticsGateway
  implements OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      realtime: {
        params: { eventsPerSecond: 10 },
        heartbeatIntervalMs: 15_000,
      },
    });
  }

  afterInit(): void {
    this.startRealtimeListener();
  }

  handleDisconnect(_client: Socket): void {
    // Socket.IO handles room cleanup automatically
  }

  // ─── Room Join ────────────────────────────────────────────────────────────

  @SubscribeMessage('joinFertilizerRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { customerId, machineId }: JoinFertilizerDto,
  ): void {
    const room = machineId
      ? `fertilizer_${customerId}_${machineId}`
      : `fertilizer_${customerId}`;

    void client.join(room);

    console.log(`Client joined room: ${room}`);
  }

  // ─── Supabase Realtime Listener ───────────────────────────────────────────

  private startRealtimeListener(): void {
    const channel: RealtimeChannel = this.supabase
      .channel('fertilizer-analytics-changes')
      .on<FertilizerAnalyticsRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fertilizer_analytics',
        },
        ({ new: newRow }) => {
          const payload = mapFertilizerAnalytics(newRow);

          // Emit to general customer room
          this.server
            .to(`fertilizer_${newRow.user_id}`)
            .emit('fertilizer_analytics_update', payload);

          // Emit to machine-specific room (if exists)
          if (newRow.machine_id) {
            this.server
              .to(`fertilizer_${newRow.user_id}_${newRow.machine_id}`)
              .emit('fertilizer_analytics_update', payload);
          }

          console.log(
            `📡 Fertilizer analytics update for user ${newRow.user_id}`,
          );
        },
      )
      .subscribe((status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Connected to Supabase Fertilizer Realtime');
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          console.error('❌ Supabase TIMED_OUT. Reconnecting...');
          void this.supabase.removeChannel(channel).then(() => {
            setTimeout(() => this.startRealtimeListener(), 5_000);
          });
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error(
            '❌ Channel Error. Ensure Realtime is enabled in Supabase.',
          );
        }
      });

    this.supabase.realtime.onHeartbeat((hbStatus) => {
      if (hbStatus === 'timeout') {
        console.warn('⚠️ Heartbeat timeout detected.');
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    console.log('Cleaning up Supabase Realtime connections...');
    await this.supabase.removeAllChannels();
  }
}
