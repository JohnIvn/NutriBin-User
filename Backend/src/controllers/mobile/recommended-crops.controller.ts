import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';

@Controller('mobile/recommendations')
export class RecommendedCropsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':machineId')
  async getRecommendations(@Param('machineId') machineId: string) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `
        SELECT 
          recommended_plants_1,
          recommended_plants_2,
          recommended_plants_3,
          recommended_plants_4,
          recommended_plants_5
        FROM data_science 
        WHERE machine_id = $1 
        ORDER BY date_created DESC 
        LIMIT 1
      `,
        [machineId],
      );

      if (result.rows.length === 0) {
        return {
          ok: true,
          recommendations: [],
        };
      }

      const row = result.rows[0];
      const recommendations = [
        row.recommended_plants_1,
        row.recommended_plants_2,
        row.recommended_plants_3,
        row.recommended_plants_4,
        row.recommended_plants_5,
      ].filter((plant) => plant !== null);

      return {
        ok: true,
        recommendations,
      };
    } catch (error) {
      console.error('Error fetching mobile recommendations:', error);
      throw new InternalServerErrorException('Failed to fetch recommendations');
    }
  }
}
