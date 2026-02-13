export interface MachineNotification {
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
