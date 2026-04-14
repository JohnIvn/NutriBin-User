import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';

interface AnnouncementRow {
  announcement_id: string;
  title: string;
  body: string;
  author: string;
  priority: string;
  notified: boolean;
  date_published: string | null;
  is_active: boolean;
  date_created: string;
}

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAnnouncements() {
    try {
      const client = this.databaseService.getClient();

      const announcementResult = await client.query<AnnouncementRow>(
        `SELECT
         announcement_id, title, body, author, priority, notified,
         date_published, is_active, date_created
       FROM announcements
       WHERE is_active = true
       ORDER BY COALESCE(date_published::timestamptz, date_created) DESC
       `,
        [],
      );

      return {
        ok: true,
        data: announcementResult.rows,
        count: announcementResult.rowCount,
        message: 'Announcements retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return {
        ok: false,
        data: null,
        error: 'Failed to retrieve announcements',
      };
    }
  }
}
