import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';

type AnnouncementRow = {
  announcement_id: string;
  title: string;
  body: string;
  author: string | null;
  priority: string | null;
  notified: string[] | null;
  date_published: string | null;
  is_active: boolean;
  date_created: string;
};

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async listAnnouncements() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<AnnouncementRow>(
        `SELECT announcement_id, title, body, author, priority, notified, date_published, is_active, date_created
         FROM announcements
         WHERE is_active = true
         ORDER BY COALESCE(date_published::timestamptz, date_created) DESC
         LIMIT 100`,
      );

      return {
        ok: true,
        announcements: result.rows,
      };
    } catch (err) {
      console.error('[Announcements] Failed to fetch announcements:', err);
      throw new InternalServerErrorException('Failed to fetch announcements');
    }
  }
}
