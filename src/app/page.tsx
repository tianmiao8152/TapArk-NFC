'use client';

import { useState, useEffect } from 'react';
import { Nfc, Smartphone, Shield, Zap } from 'lucide-react';
import NFCReader from '@/components/NFCReader';
import NFCWriter from '@/components/NFCWriter';
import BinaryEditor from '@/components/BinaryEditor';
import DataManager from '@/components/DataManager';
import NFCDataDisplay from '@/components/NFCDataDisplay';
import EnvironmentDetector from '@/components/EnvironmentDetector';
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
    <div className="min-h-screen">
      <EnvironmentDetector />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Nfc className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">TapArk NFC</h1>
          <p className="text-lg text-muted-foreground mb-6">
            专业NFC工具，支持读取、写入、二进制编辑和数据管理
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Smartphone, label: 'WebNFC', desc: '原生支持' },
            { icon: Shield, label: '离线可用', desc: 'PWA支持' },
            { icon: Zap, label: '高速读写', desc: '实时操作' },
            { icon: Nfc, label: '全格式', desc: 'NDEF兼容' },
          ].map((feature, index) => (
            <div key={index} className="card p-5 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium mb-1">{feature.label}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
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
        </div>
      </div>

      <footer className="text-center py-8 text-sm text-muted-foreground">
        <p>TapArk NFC Tool v1.0.0</p>
      </footer>
    </div>
  );
}
