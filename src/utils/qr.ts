import QRCode from 'qrcode';

/**
 * Generate a QR Code data URL (PNG) for a given credential token or student ID
 */
export async function generateQrDataUrl(text: string, width: number = 300): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

/**
 * Generate random student QR credential token
 */
export function generateRandomToken(studentId: string): string {
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `SRH-${studentId}-${randomStr}`;
}
