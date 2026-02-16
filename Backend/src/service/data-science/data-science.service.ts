import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DataScienceService {
  private readonly crops = [
    { name: 'Rice', n: 100, p: 50, k: 50, ph_min: 5.5, ph_max: 6.5 },
    { name: 'Corn', n: 125, p: 65, k: 80, ph_min: 5.8, ph_max: 7.0 },
    { name: 'Tomato', n: 85, p: 55, k: 100, ph_min: 6.0, ph_max: 6.8 },
    { name: 'Lettuce', n: 120, p: 40, k: 65, ph_min: 6.0, ph_max: 7.0 },
    { name: 'Potato', n: 100, p: 80, k: 125, ph_min: 4.8, ph_max: 5.5 },
    { name: 'Carrot', n: 60, p: 80, k: 100, ph_min: 6.0, ph_max: 6.8 },
    { name: 'Cabbage', n: 140, p: 50, k: 80, ph_min: 6.5, ph_max: 7.5 },
  ];

  constructor(private readonly databaseService: DatabaseService) {}

  async calculateRecommendations(machineId: string) {
    const client = this.databaseService.getClient();

    // Fetch latest fertilizer record
    const result = await client.query(
      `
      SELECT 
        regexp_replace(nitrogen, '[^0-9.]', '', 'g') as n,
        regexp_replace(phosphorus, '[^0-9.]', '', 'g') as p,
        regexp_replace(potassium, '[^0-9.]', '', 'g') as k,
        regexp_replace(ph, '[^0-9.]', '', 'g') as ph
      FROM fertilizer_analytics 
      WHERE machine_id = $1 
      ORDER BY date_created DESC 
      LIMIT 1
    `,
      [machineId],
    );

    if (result.rows.length === 0) {
      return [];
    }

    const current = {
      n: parseFloat(result.rows[0].n || '0') || 0,
      p: parseFloat(result.rows[0].p || '0') || 0,
      k: parseFloat(result.rows[0].k || '0') || 0,
      ph: parseFloat(result.rows[0].ph || '0') || 0,
    };

    const recommendations = this.crops
      .map((crop) => {
        // NPK Distance (Lower is better)
        const distance = Math.sqrt(
          Math.pow(current.n - crop.n, 2) +
            Math.pow(current.p - crop.p, 2) +
            Math.pow(current.k - crop.k, 2),
        );

        // pH Match (Binary/Penalty)
        const phPenalty =
          current.ph >= crop.ph_min && current.ph <= crop.ph_max ? 0 : 20;

        // Similarity score (0-100)
        const baseScore = Math.max(0, 100 - distance / 2);
        const finalScore = Math.max(0, baseScore - phPenalty);

        return {
          name: crop.name,
          score: Math.round(finalScore),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return recommendations;
  }
}
