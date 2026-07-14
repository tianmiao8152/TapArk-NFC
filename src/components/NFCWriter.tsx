'use client';

import { useState, useEffect } from 'react';
import { Nfc, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';
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
    <div className="bg-nfc-light rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Send className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">NFC 写入</h3>
            <p className="text-sm text-gray-400">将数据写入NFC标签</p>
          </div>
        </div>
        {isSupported ? (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">支持</span>
        ) : (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">不支持</span>
        )}
      </div>

      <button
        onClick={handleWrite}
        disabled={status === 'writing' || !isSupported || !hasData}
        className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
          status === 'writing' || !hasData
            ? 'bg-gray-600 cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-500'
            : status === 'error'
            ? 'bg-red-500'
            : 'bg-green-500 hover:bg-green-600 active:scale-95'
        }`}
      >
        {status === 'writing' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在写入...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>写入成功</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>写入失败</span>
          </>
        ) : (
          <>
            <Nfc className="w-5 h-5" />
            <span>写入到 NFC 标签</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {status === 'writing' && (
        <div className="mt-4 relative h-32 border-2 border-dashed border-green-500/30 rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Nfc className="w-12 h-12 text-green-400/50" />
          </div>
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan" />
          <p className="absolute bottom-2 left-0 right-0 text-center text-sm text-gray-400">
            将NFC标签靠近设备
          </p>
        </div>
      )}

      {!hasData && status === 'idle' && (
        <div className="mt-4 p-4 bg-gray-500/10 rounded-xl">
          <p className="text-sm text-gray-400">请先读取或导入NFC数据</p>
        </div>
      )}
    </div>
  );
}
