import type { FC } from 'react';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  url: string;
  size?: number;
}

const QRCode: FC<QRCodeProps> = ({ url, size = 80 }) => <QRCodeSVG value={url} size={size} bgColor='white' fgColor='black' level='M' title='QR code' />;

export default QRCode;
