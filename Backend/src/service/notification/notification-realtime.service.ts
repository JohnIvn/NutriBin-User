/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require */
import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { MachineNotificationsGateway } from './machine-notifications.gateway';

export interface MachineNotification {
  notification_id: string;
  machine_id: string;
  header: string;
  subheader?: string;
  type: string;
  description?: string;
  date?: string;
  resolved: boolean;
  date_created: string;
}

@Injectable()
export class NotificationsRealtimeService implements OnModuleInit {
  private supabase;

  constructor(
    @Inject(forwardRef(() => MachineNotificationsGateway))
    private readonly gateway: MachineNotificationsGateway,
  ) {}

  async onModuleInit() {
    const dbUrl = process.env.DB_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!dbUrl || !serviceKey) {
      throw new Error('Missing Supabase environment variables!');
    }

    this.supabase = createClient(dbUrl, serviceKey);

    // Subscribe to new inserts
    this.supabase
      .channel('machine-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'machine_notifications',
        },
        (payload) => {
          const notification: MachineNotification = payload.new;
          this.handleNotification(notification);
        },
      )
      .subscribe();
  }

  private handleNotification(notification: MachineNotification) {
    // You can add server-side logic here
    // e.g., authorization, enrichment, dedupe, throttling

    this.gateway.emitNotification(notification.machine_id, notification);
  }

  // Function to fetch existing notifications for a machine (copied from your previous service)
  async getNotificationsByMachine(
    machine_id: string,
  ): Promise<MachineNotification[]> {
    const { data, error } = await this.supabase
      .from('machine_notifications')
      .select(
        'notification_id, machine_id, header, subheader, type, description, date, resolved, date_created',
      )
      .eq('machine_id', machine_id)
      .order('date_created', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error.message);
      return [];
    }

    return data || [];
  }
}
