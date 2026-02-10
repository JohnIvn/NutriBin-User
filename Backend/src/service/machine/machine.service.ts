import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MachineService {
  constructor(private readonly databaseService: DatabaseService) {}

//   async function fetchMachineId (@Body('customerId') customerId: string) {
// 	return {ok: true, id: customerId}
//   }
}
