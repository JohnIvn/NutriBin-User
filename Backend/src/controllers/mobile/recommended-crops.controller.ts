import { Controller, Get, Param } from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';
import { DataScienceService } from '../../service/data-science/data-science.service';

@Controller('mobile/recommendations')
export class RecommendedCropsController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly dataScienceService: DataScienceService,
  ) {}

  @Get(':machineId')
  async getRecommendations(@Param('machineId') machineId: string) {
    try {
      if (!machineId) {
        return { ok: false, message: 'Machine ID is required' };
      }

      // Always calculate on the fly to ensure data is "changing" with sensors
      // We can still try to get from data_science table first if you want,
      // but calculating from latest fertilizer_analytics is more "live".
      const recommendations =
        await this.dataScienceService.calculateRecommendations(machineId);

      // Optionally update the data_science table here to keep it in sync
      if (recommendations.length > 0) {
        // ... could add logic to save to data_science table here if wanted ...
      }

      return {
        ok: true,
        recommendations,
      };
    } catch (error) {
      console.error('Error fetching mobile recommendations:', error);
      return {
        ok: false,
        recommendations: [],
        message: 'Failed to fetch recommendations',
      };
    }
  }
}
