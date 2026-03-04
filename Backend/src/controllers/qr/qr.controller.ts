import {
  Controller,
  Get,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import QRCode from 'qrcode';

@Controller('qr')
export class QrController {
  @Get('generate/:serial')
  async generateQR(@Param('serial') serial: string, @Res() res: Response) {
    try {
      if (!serial) {
        throw new BadRequestException('Serial number is required');
      }

      // Generate QR code as a data URL (PNG image)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const qrCodeDataUrl = (await (QRCode as any).toDataURL(serial, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
      })) as string;

      // Return as JSON with base64 encoded image
      res.json({
        ok: true,
        qrCode: qrCodeDataUrl,
        serial: serial,
        message: 'QR code generated successfully',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate QR code';
      res.status(400).json({
        ok: false,
        error: errorMessage,
      });
    }
  }
}
