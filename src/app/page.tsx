'use client';

import { useState, useEffect } from 'react';
import { Nfc, Smartphone, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-10" />
      </div>

      {/* Environment Detection */}
      <EnvironmentDetector />

      {/* Header */}
      <header className="relative pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-primary mb-6 animate-float shadow-lg shadow-primary/30">
            <Nfc className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="gradient-text">TapArk NFC</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6 text-balance max-w-2xl mx-auto">
            专业NFC工具，支持读取、写入、二进制编辑和数据管理
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>支持 Chrome for Android 89+</span>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Smartphone, label: 'WebNFC', desc: '原生支持', color: 'from-blue-500 to-cyan-500' },
            { icon: Shield, label: '离线可用', desc: 'PWA支持', color: 'from-green-500 to-emerald-500' },
            { icon: Zap, label: '高速读写', desc: '实时操作', color: 'from-orange-500 to-amber-500' },
            { icon: Nfc, label: '全格式', desc: 'NDEF兼容', color: 'from-purple-500 to-pink-500' },
          ].map((feature, index) => (
            <div
              key={index}
              className="glass-card-hover p-5 text-center group cursor-default"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.label}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 space-y-6">
        <div className="grid gap-6">
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
      </main>

      {/* Footer */}
      <footer className="text-center py-12 mt-12">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span>TapArk NFC Tool v1.0.0</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>支持 Chrome for Android 89+</span>
        </div>
      </footer>
    </div>
  );
}
