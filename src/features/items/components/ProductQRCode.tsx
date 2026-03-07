import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { item_service } from '../services/items.service';

interface ProductQRCodeProps {
  itemId: string;
  itemName?: string;
  size?: number;
  showDownload?: boolean;
}

export const ProductQRCode: React.FC<ProductQRCodeProps> = ({
  itemId,
  itemName: _itemName = 'produto',
  size = 200,
  showDownload = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [type, setType] = useState<'barcode' | 'generated' | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await item_service.getQRCodeData(itemId);
        setQrData(response.qrCodeData);
        setType(response.type);
      } catch (err) {
        console.error('Failed to fetch QR code data:', err);
        setError('Não foi possível gerar o QR Code');
      } finally {
        setLoading(false);
      }
    };

    fetchQRData();
  }, [itemId]);

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `produto-${itemId}-qrcode.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 p-4 bg-red-50 rounded-lg"
        style={{ width: size, height: size }}
      >
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-xs text-red-600 text-center">{error || 'Erro desconhecido'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={qrRef} className="bg-white p-3 rounded-xl shadow-xl">
        <QRCodeSVG value={qrData} size={size} level="H" includeMargin={false} />
      </div>

      {type === 'generated' && (
        <p className="text-xs text-slate-400 text-center">
          QR Code gerado — produto sem código de barras
        </p>
      )}

      {showDownload && (
        <button
          onClick={handleDownload}
          className="btn btn-sm btn-outline gap-2"
        >
          <Download className="w-4 h-4" />
          Baixar QR Code
        </button>
      )}
    </div>
  );
};
