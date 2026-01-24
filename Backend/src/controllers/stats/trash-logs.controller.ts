import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Query,
} from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';

type TrashLogRow = {
  log_id: string;
  machine_id: string | null;
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  moisture: string | null;
  humidity: string | null;
  temperature: string | null;
  ph: string | null;
  date_created: string;
};

