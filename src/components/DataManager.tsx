'use client';

import { useState, useRef } from 'react';
import { Download, Upload, FileJson, RefreshCw, Trash2 } from 'lucide-react';
import { exportToFile, importFromFile, formatBytes, type NFCData } from '@/lib/nfc';

interface DataManagerProps {
  nfcData: NFCData | null;
  onImport: (data: NFCData) => void;
  onClear: () => void;
}

export default function DataManager({ nfcData, onImport, onClear }: DataManagerProps) {
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!nfcData) return;
    const filename = `nfc-data-${Date.now()}.json`;
    exportToFile(nfcData, filename);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError('');

    try {
      const data = await importFromFile(file);
      onImport(data);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const totalSize = nfcData?.records.reduce((acc, record) => acc + record.data.length, 0) || 0;

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center border border-orange-500/20">
          <FileJson className="w-7 h-7 text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">数据管理</h3>
          <p className="text-sm text-muted-foreground">导入/导出NFC数据</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={handleExport}
          disabled={!nfcData || nfcData.records.length === 0}
          className={`flex flex-col items-center justify-center gap-3 py-5 rounded-xl transition-all duration-300 ${
            nfcData && nfcData.records.length > 0
              ? 'gradient-primary text-white hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
              : 'bg-secondary text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Download className="w-6 h-6" />
          <span className="text-sm font-medium">导出数据</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={`flex flex-col items-center justify-center gap-3 py-5 rounded-xl transition-all duration-300 ${
            importing
              ? 'bg-secondary text-muted-foreground cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30 active:scale-[0.98]'
          }`}
        >
          {importing ? (
            <>
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-sm font-medium">导入中...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">导入数据</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {nfcData && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card-hover p-4 text-center">
            <p className="text-2xl font-bold text-white">{nfcData.records.length}</p>
            <p className="text-xs text-muted-foreground mt-1">记录数</p>
          </div>
          <div className="glass-card-hover p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{formatBytes(totalSize)}</p>
            <p className="text-xs text-muted-foreground mt-1">数据大小</p>
          </div>
          <div className="glass-card-hover p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{formatBytes(nfcData.maxSize)}</p>
            <p className="text-xs text-muted-foreground mt-1">最大容量</p>
          </div>
        </div>
      )}

      {importError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{importError}</p>
        </div>
      )}

      {nfcData && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="font-medium">清空数据</span>
        </button>
      )}

      <div className="mt-6 p-4 bg-secondary/50 border border-white/5 rounded-xl">
        <p className="text-xs text-muted-foreground leading-relaxed">
          数据文件格式：JSON，包含NFC标签的完整信息，可用于备份和恢复。支持导入之前导出的.nfc文件。
        </p>
      </div>
    </div>
  );
}
