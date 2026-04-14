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

interface DashboardRow {
  machine_id: string;
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  moisture: string | null;
  humidity: string | null;
  temperature: string | null;
  ph: string | null;
  methane: string | null;
  air_quality: string | null;
  carbon_monoxide: string | null;
  combustible_gases: string | null;
  weight_kg: string | null;
  reed_switch: string | null;
  date_created: string;
}

interface AnnouncementRow {
  announcement_id: string;
  title: string;
  body: string;
  priority: string | null;
  date_published: string | null;
  is_active: boolean;
  date_created: string;
}

// ─────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────

function mapDashboardData(row: DashboardRow) {
  return {
    machineId: row.machine_id,
    sensors: {
      nitrogen: row.nitrogen ? parseFloat(row.nitrogen) : null,
      phosphorus: row.phosphorus ? parseFloat(row.phosphorus) : null,
      potassium: row.potassium ? parseFloat(row.potassium) : null,
      moisture: row.moisture ? parseFloat(row.moisture) : null,
      humidity: row.humidity ? parseFloat(row.humidity) : null,
      temperature: row.temperature ? parseFloat(row.temperature) : null,
      ph: row.ph ? parseFloat(row.ph) : null,
      methane: row.methane ? parseFloat(row.methane) : null,
      air_quality: row.air_quality ? parseFloat(row.air_quality) : null,
      carbon_monoxide: row.carbon_monoxide
        ? parseFloat(row.carbon_monoxide)
        : null,
      combustible_gases: row.combustible_gases
        ? parseFloat(row.combustible_gases)
        : null,
      weight_kg: row.weight_kg ? parseFloat(row.weight_kg) : null,
      reed_switch: row.reed_switch ? parseFloat(row.reed_switch) : null,
    },
    date_created: row.date_created,
  };
}

type DashboardPayload = ReturnType<typeof mapDashboardData>;

// ─────────────────────────────────────────────────────────────
// Socket Event Maps
// ─────────────────────────────────────────────────────────────

interface ServerToClientEvents {
  dashboard_update: (payload: DashboardPayload) => void;
}

interface ClientToServerEvents {
  joinDashboardRoom: (data: JoinDashboardDto) => void;
}

interface JoinDashboardDto {
  machineId?: string;
}

// ─────────────────────────────────────────────────────────────
// Supabase Schema
// ─────────────────────────────────────────────────────────────

interface Database {
  public: {
    Tables: {
      fertilizer_analytics: { Row: DashboardRow };
      announcements: { Row: AnnouncementRow };
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
export class DashboardGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly supabase: SupabaseClient<Database>;
  private channel: RealtimeChannel | null = null;
  private isReconnecting = false;

  constructor() {
    this.supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      realtime: { params: { eventsPerSecond: 5 }, heartbeatIntervalMs: 15_000 },
    });
  }

  afterInit(): void {
    this.startRealtimeListener();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: Socket): void {
    // Socket.IO auto handles room cleanup
  }

  @SubscribeMessage('joinDashboardRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { machineId }: JoinDashboardDto,
  ) {
    const room = machineId ? `dashboard_${machineId}` : `dashboard_all`;
    void client.join(room);
    console.log(`Client joined dashboard room: ${room}`);
  }

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
      .channel('dashboard-changes')
      .on<DashboardRow>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fertilizer_analytics' },
        ({ new: newRow }) => {
          const payload = mapDashboardData(newRow);
          this.server
            .to(`dashboard_${newRow.machine_id}`)
            .emit('dashboard_update', payload);
          console.log(`📡 Dashboard update for machine ${newRow.machine_id}`);
        },
      )
      .subscribe((status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Connected to Supabase Dashboard Realtime');
          this.isReconnecting = false;
        } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          console.error('❌ Supabase dashboard TIMED_OUT. Reconnecting...');
          this.isReconnecting = true;
          setTimeout(() => {
            void this.startRealtimeListener();
          }, 5_000);
        } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error('❌ Dashboard channel error');
        }
      });
  }

  async onModuleDestroy(): Promise<void> {
    console.log('Cleaning up Supabase Realtime connections...');
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
