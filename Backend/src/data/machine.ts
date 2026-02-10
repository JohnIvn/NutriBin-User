export interface MachineStatus {
  fertilizer_analytics_id: string;
  user_id?: string | null;
  machine_id?: string | null;
  nitrogen?: string | null;
  air_quality?: string | null;
  potassium?: string | null;
  temperature?: string | null;
  ph?: string | null;
  humidity?: string | null;
  moisture?: string | null;
  methane?: string | null;
  hydrogen?: string | null;
  smoke?: string | null;
  benzene?: string | null;
  date_created: string;
}

export interface MachineSerial {
  machine_serial_id: string;
  serial_number: string;
  is_used: boolean;
  is_active: boolean;
  date_created: string;
}

export interface MachineDto {
  customerId: string;
  name: string;
  wifi_ssid: string;
  wifi_password: string;
}

export interface TrashLog {
  log_id: string;
  machine_id?: string | null;
  nitrogen?: string | null;
  phosphorus?: string | null;
  potassium?: string | null;
  moisture?: string | null;
  humidity?: string | null;
  temperature?: string | null;
  ph?: string | null;
  date_created: string;
}
