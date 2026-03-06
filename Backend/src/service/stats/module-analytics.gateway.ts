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

// ─────────────────────────────────────────────────────────────
// Domain Types
// ─────────────────────────────────────────────────────────────

interface MachineAnalyticsRow {
  machine_id: string;
  user_id: string;
  is_active: boolean | null;
  c1: boolean | null;
  c2: boolean | null;
  c3: boolean | null;
  c4: boolean | null;
  s1: boolean | null;
  s2: boolean | null;
  s3: boolean | null;
  s4: boolean | null;
  s5: boolean | null;
  s6: boolean | null;
  s7: boolean | null;
  s8: boolean | null;
  s9: boolean | null;
  s10: boolean | null;
  s11: boolean | null;
  m1: boolean | null;
  m2: boolean | null;
  m3: boolean | null;
  m4: boolean | null;
  m5: boolean | null;
  firmware_version: string | null;
  target_firmware_version: string | null;
  update_status: string | null;
  last_update_attempt: string | null;
  last_seen: string | null;
  date_created: string;
}

// ─────────────────────────────────────────────────────────────
// Mapper (same as controller)
// ─────────────────────────────────────────────────────────────

function mapMachineAnalytics(row: MachineAnalyticsRow) {
  return {
    id: row.machine_id,
    is_active: row.is_active,
    modules: {
      arduino_q: row.c1,
      esp32_filter: row.c2,
      esp32_sensors: row.c3,
      esp32_servo: row.c4,
      camera: row.s1,
      humidity: row.s2,
      methane: row.s3,
      carbon_monoxide: row.s4,
      air_quality: row.s5,
      combustible_gasses: row.s6,
      npk: row.s7,
      moisture: row.s8,
      reed: row.s9,
      ultrasonic: row.s10,
      weight: row.s11,
      servo_a: row.m1,
      servo_b: row.m2,
      servo_mixer: row.m3,
      grinder: row.m4,
      exhaust: row.m5,
      firmware_version: row.firmware_version,
      target_firmware_version: row.target_firmware_version,
      update_status: row.update_status,
      last_update_attempt: row.last_update_attempt,
      last_seen: row.last_seen,
    },
    date_created: row.date_created,
  };
}

type ModuleAnalyticsPayload = ReturnType<typeof mapMachineAnalytics>;

// ─────────────────────────────────────────────────────────────
// Socket Event Maps
// ─────────────────────────────────────────────────────────────

interface ServerToClientEvents {
  module_analytics_update: (payload: ModuleAnalyticsPayload) => void;
}

interface ClientToServerEvents {
  joinModuleRoom: (data: JoinModuleDto) => void;
}

interface JoinModuleDto {
  machineId?: string;
}

// ─────────────────────────────────────────────────────────────
// Supabase Schema
// ─────────────────────────────────────────────────────────────

interface Database {
  public: {
    Tables: {
      machines: { Row: MachineAnalyticsRow };
    };
  };
}

// ─────────────────────────────────────────────────────────────
// Environment
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY ?? '';

// ─────────────────────────────────────────────────────────────
// Gateway
// ─────────────────────────────────────────────────────────────

@WebSocketGateway({ cors: true })
export class ModuleAnalyticsGateway
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: Socket): void {
    // Socket.IO auto cleans rooms
  }

  // ───────────────────────────────────────────────────────────
  // Room Join
  // ───────────────────────────────────────────────────────────

  @SubscribeMessage('joinModuleRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { machineId }: JoinModuleDto,
  ): void {
    const room = machineId ? `module_${machineId}` : `module_${machineId}`;

    void client.join(room);

    console.log(`Client joined room: ${room}`);
  }

  // ───────────────────────────────────────────────────────────
  // Supabase Realtime Listener
  // ───────────────────────────────────────────────────────────

  private startRealtimeListener(): void {
    const channel: RealtimeChannel = this.supabase
      .channel('machine-analytics-changes')
      .on<MachineAnalyticsRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'machines',
        },
        ({ new: newRow }) => {
          const payload = mapMachineAnalytics(newRow);

          // Emit to machine-specific room
          this.server
            .to(`module_${newRow.machine_id}`)
            .emit('module_analytics_update', payload);

          console.log(`📡 Module analytics update for machine ${newRow.machine_id}`);
        },
      )
      .subscribe((status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Connected to Supabase Module Realtime');
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
