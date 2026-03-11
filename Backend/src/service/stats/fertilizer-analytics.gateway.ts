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

type FertilizerAnalyticsPayload = ReturnType<typeof mapFertilizerAnalytics>;

interface ServerToClientEvents {
  fertilizer_analytics_update: (payload: FertilizerAnalyticsPayload) => void;
}

interface ClientToServerEvents {
  joinFertilizerRoom: (data: JoinFertilizerDto) => void;
}

interface JoinFertilizerDto {
  machineId: string;
}

type MachineRow = {
  is_active: boolean | null;
};

interface Database {
  public: {
    Tables: {
      fertilizer_analytics: { Row: FertilizerAnalyticsRow };
    };
  };
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY ?? '';

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

  // ─── Join Machine Room ─────────────────────────────────────

  @SubscribeMessage('joinFertilizerRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { machineId }: JoinFertilizerDto,
  ): void {
    const room = `fertilizer_${machineId}`;

    void client.join(room);

    console.log(`Client joined machine room: ${room}`);
  }

  // ─── Supabase Listener ─────────────────────────────────────

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
        async ({ new: newRow }) => {
          if (!newRow.machine_id) return;

          try {
            const { data: machine, error } = await this.supabase
              .from('machines')
              .select('is_active')
              .eq('machine_id', newRow.machine_id)
              .single<MachineRow>();

            if (error) {
              console.error('Machine lookup failed:', error);
              return;
            }

            if (!machine?.is_active) {
              console.log(
                `⚠️ Machine ${newRow.machine_id} is inactive. Skipping realtime emit.`,
              );
              return;
            }

            const payload = mapFertilizerAnalytics(newRow);

            this.server
              .to(`fertilizer_${newRow.machine_id}`)
              .emit('fertilizer_analytics_update', payload);

            console.log(
              `📡 Fertilizer update for machine ${newRow.machine_id}`,
            );
          } catch (err) {
            console.error('Realtime processing error:', err);
          }
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
            setTimeout(() => this.startRealtimeListener(), 5000);
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
