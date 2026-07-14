'use client';

import { useState, useEffect } from 'react';
import { Nfc, Loader2, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import { readNFC, isNFCSupported, type NFCData } from '@/lib/nfc';

interface NFCReaderProps {
  onRead: (data: NFCData) => void;
}

export default function NFCReader({ onRead }: NFCReaderProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isNFCSupported());
  }, []);

  const handleScan = async () => {
    if (!isSupported) {
      setError('您的浏览器不支持WebNFC功能，请使用Chrome for Android 89+');
      setStatus('error');
      return;
    }

    setStatus('scanning');
    setError('');

    try {
      const data = await readNFC();
      onRead(data);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取失败');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Nfc className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">NFC 读取</h3>
            <p className="text-sm text-muted-foreground">读取NFC标签内容</p>
          </div>
        </div>
        {isSupported ? (
          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">已就绪</span>
        ) : (
          <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">不支持</span>
        )}
      </div>

      <button
        onClick={handleScan}
        disabled={status === 'scanning' || !isSupported}
        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          status === 'scanning'
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {status === 'scanning' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在扫描...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>读取成功</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>读取失败</span>
          </>
        ) : (
          <>
            <Nfc className="w-5 h-5" />
            <span>开始扫描 NFC</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {status === 'scanning' && (
        <div className="mt-6 relative h-40 border-2 border-dashed border-primary/30 rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Nfc className="w-16 h-16 text-primary/30" />
          </div>
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
            将NFC标签靠近设备
          </p>
        </div>
      )}

      {!isSupported && status === 'idle' && (
        <div className="mt-4 p-4 bg-muted/50 border border-border rounded-lg flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            WebNFC功能需要在支持NFC的设备上使用Chrome for Android 89+浏览器
          </p>
        </div>
      )}
    </div>
  );
}
