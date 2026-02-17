import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import {
  createClient,
  SupabaseClient,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js';
import { Server, Socket } from 'socket.io';

interface MachineNotification {
  notification_id: string;
  machine_id: string;
  header: string;
  subheader?: string | null;
  type: string;
  description?: string | null;
  date?: Date | null;
  resolved?: boolean | null;
  date_created?: Date | null;
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

@WebSocketGateway({ cors: true })
export class MachineNotificationsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;
  private supabase: SupabaseClient<any, 'public'>;

  constructor() {
    this.supabase = createClient<any, 'public'>(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
    );
  }

  afterInit() {
    this.startSupabaseListener();
  }

  private startSupabaseListener() {
    this.supabase
      .channel('machine-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'machine_notifications' },
        (payload: RealtimePostgresInsertPayload<MachineNotification>) => {
          const newNotif = payload.new; // Fully typed as MachineNotification
          console.log('INSERT detected:', payload);
          this.server
            .to(newNotif.machine_id)
            .emit('notification_created', newNotif);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'machine_notifications' },
        (payload: RealtimePostgresUpdatePayload<MachineNotification>) => {
          console.log('================ UPDATE DETECTED ================');
          console.log('Full Payload:', payload);
          console.log('Old Row:', payload.old);
          console.log('New Row:', payload.new);

          const updatedNotif = payload.new;

          console.log('Resolved Value:', updatedNotif?.resolved);
          console.log('Machine ID:', updatedNotif?.machine_id);
          console.log('Notification ID:', updatedNotif?.notification_id);

          if (updatedNotif?.resolved) {
            console.log('Emitting notification_resolved event...');

            this.server
              .to(updatedNotif.machine_id)
              .emit('notification_resolved', {
                notification_id: updatedNotif.notification_id,
                machine_id: updatedNotif.machine_id,
              });
          } else {
            console.log('Resolved is false — not emitting');
          }

          console.log('=================================================');
        },
      )

      .subscribe((status) => {
        console.log('Supabase subscription status:', status); // 👈 ADD THIS
      });
  }

  @SubscribeMessage('subscribeToMachine')
  handleJoinMachine(
    @ConnectedSocket() client: Socket,
    @MessageBody() machine_id: string,
  ) {
    if (machine_id) {
      client.join(machine_id);
    }
  }
}
