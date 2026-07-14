'use client';

import { useState, useEffect } from 'react';
import { Nfc, Loader2, CheckCircle2, AlertCircle, Send, WifiOff } from 'lucide-react';
import { writeNFC, isNFCSupported, type NFCRecord } from '@/lib/nfc';

interface NFCWriterProps {
  records: NFCRecord[];
}

export default function NFCWriter({ records }: NFCWriterProps) {
  const [status, setStatus] = useState<'idle' | 'writing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isNFCSupported());
  }, []);

  const handleWrite = async () => {
    if (!isSupported) {
      setError('您的浏览器不支持WebNFC功能，请使用Chrome for Android 89+');
      setStatus('error');
      return;
    }

    if (records.length === 0) {
      setError('没有数据可写入');
      setStatus('error');
      return;
    }

    setStatus('writing');
    setError('');

    try {
      await writeNFC(records);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '写入失败');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const hasData = records.length > 0 && records.some((r) => r.data.length > 0);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <Send className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">NFC 写入</h3>
            <p className="text-sm text-muted-foreground">将数据写入NFC标签</p>
          </div>
        </div>
        {isSupported ? (
          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">已就绪</span>
        ) : (
          <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">不支持</span>
        )}
      </div>

      <button
        onClick={handleWrite}
        disabled={status === 'writing' || !isSupported || !hasData}
        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          status === 'writing' || !hasData
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {status === 'writing' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在写入...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>写入成功</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>写入失败</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>写入到 NFC 标签</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {status === 'writing' && (
        <div className="mt-6 relative h-40 border-2 border-dashed border-green-500/30 rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Nfc className="w-16 h-16 text-green-500/30" />
          </div>
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan" />
          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
            将NFC标签靠近设备
          </p>
        </div>
      )}

      {!hasData && status === 'idle' && (
        <div className="mt-4 p-4 bg-muted/50 border border-border rounded-lg flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">请先读取或导入NFC数据</p>
        </div>
      )}
    </div>
  );
}
