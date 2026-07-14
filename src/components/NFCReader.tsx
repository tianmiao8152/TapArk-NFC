'use client';

import { useState, useEffect } from 'react';
import { Nfc, Loader2, CheckCircle2, AlertCircle, WifiOff, ArrowRight } from 'lucide-react';
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
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Nfc className="w-7 h-7 text-primary" />
            </div>
            {status === 'scanning' && (
              <div className="absolute -top-1 -right-1 w-4 h-4">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">NFC 读取</h3>
            <p className="text-sm text-muted-foreground">读取NFC标签内容</p>
          </div>
        </div>
        {isSupported ? (
          <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
            已就绪
          </span>
        ) : (
          <span className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20">
            不支持
          </span>
        )}
      </div>

      <button
        onClick={handleScan}
        disabled={status === 'scanning' || !isSupported}
        className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 group ${
          status === 'scanning'
            ? 'bg-secondary text-muted-foreground cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'gradient-primary text-white hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
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
            <Nfc className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>开始扫描 NFC</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {status === 'scanning' && (
        <div className="mt-6 relative h-40 border-2 border-dashed border-primary/30 rounded-2xl overflow-hidden bg-primary/5">
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
        <div className="mt-4 p-4 bg-secondary/50 border border-white/5 rounded-xl flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            WebNFC功能需要在支持NFC的设备上使用Chrome for Android 89+浏览器
          </p>
        </div>
      )}
    </div>
  );
}
