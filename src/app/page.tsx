'use client';

import { useState, useEffect } from 'react';
import { Nfc, Smartphone, Shield, Zap } from 'lucide-react';
import NFCReader from '@/components/NFCReader';
import NFCWriter from '@/components/NFCWriter';
import BinaryEditor from '@/components/BinaryEditor';
import DataManager from '@/components/DataManager';
import NFCDataDisplay from '@/components/NFCDataDisplay';
import { type NFCData } from '@/lib/nfc';

export default function Home() {
  const [nfcData, setNfcData] = useState<NFCData | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }
  }, []);

  const handleRead = (data: NFCData) => {
    setNfcData(data);
  };

  const handleImport = (data: NFCData) => {
    setNfcData(data);
  };

  const handleClear = () => {
    setNfcData(null);
  };

  const handleUpdateRecords = (records: NFCData['records']) => {
    if (nfcData) {
      setNfcData({ ...nfcData, records });
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 py-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Nfc className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TapArk NFC</h1>
              <p className="text-sm text-white/70">专业NFC工具</p>
            </div>
          </div>
          <p className="text-center text-sm text-white/60">
            支持NFC读取、写入、二进制编辑和数据管理
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-nfc-light rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium">WebNFC</p>
              <p className="text-xs text-gray-400">原生支持</p>
            </div>
          </div>
          <div className="bg-nfc-light rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">离线可用</p>
              <p className="text-xs text-gray-400">PWA支持</p>
            </div>
          </div>
          <div className="bg-nfc-light rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium">高速读写</p>
              <p className="text-xs text-gray-400">实时操作</p>
            </div>
          </div>
          <div className="bg-nfc-light rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Nfc className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">全格式</p>
              <p className="text-xs text-gray-400">NDEF兼容</p>
            </div>
          </div>
        </section>

        <NFCReader onRead={handleRead} />

        <NFCWriter records={nfcData?.records || []} />

        {nfcData && <NFCDataDisplay data={nfcData} />}

        <BinaryEditor
          records={nfcData?.records || []}
          onUpdate={handleUpdateRecords}
        />

        <DataManager
          nfcData={nfcData}
          onImport={handleImport}
          onClear={handleClear}
        />
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        <p>TapArk NFC Tool v1.0.0</p>
        <p className="mt-1">支持Chrome for Android 89+</p>
      </footer>
    </div>
  );
}
