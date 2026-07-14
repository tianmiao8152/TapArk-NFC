'use client';

import { useState, useEffect } from 'react';
import { Nfc, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="bg-nfc-light rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <Nfc className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">NFC 读取</h3>
            <p className="text-sm text-gray-400">读取NFC标签内容</p>
          </div>
        </div>
        {isSupported ? (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">支持</span>
        ) : (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">不支持</span>
        )}
      </div>

      <button
        onClick={handleScan}
        disabled={status === 'scanning' || !isSupported}
        className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
          status === 'scanning'
            ? 'bg-primary-600 cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-500'
            : status === 'error'
            ? 'bg-red-500'
            : 'bg-primary-500 hover:bg-primary-600 active:scale-95'
        }`}
      >
        {status === 'scanning' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在扫描...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="w-5 h-5" />
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
        <p className="mt-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {status === 'scanning' && (
        <div className="mt-4 relative h-32 border-2 border-dashed border-primary-500/30 rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Nfc className="w-12 h-12 text-primary-400/50" />
          </div>
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-scan" />
          <p className="absolute bottom-2 left-0 right-0 text-center text-sm text-gray-400">
            将NFC标签靠近设备
          </p>
        </div>
      )}

      {!isSupported && (
        <div className="mt-4 p-4 bg-red-500/10 rounded-xl">
          <p className="text-sm text-red-400">
            WebNFC功能需要在支持NFC的设备上使用Chrome for Android 89+浏览器
          </p>
        </div>
      )}
    </div>
  );
}
