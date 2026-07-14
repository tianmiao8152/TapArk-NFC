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
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
          <FileJson className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">数据管理</h3>
          <p className="text-sm text-muted-foreground">导入/导出NFC数据</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={handleExport}
          disabled={!nfcData || nfcData.records.length === 0}
          className={`flex flex-col items-center justify-center gap-3 py-5 rounded-lg transition-colors border ${
            nfcData && nfcData.records.length > 0
              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
              : 'bg-muted text-muted-foreground border-border cursor-not-allowed'
          }`}
        >
          <Download className="w-6 h-6" />
          <span className="text-sm font-medium">导出数据</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={`flex flex-col items-center justify-center gap-3 py-5 rounded-lg transition-colors border ${
            importing
              ? 'bg-muted text-muted-foreground border-border cursor-not-allowed'
              : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
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
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{nfcData.records.length}</p>
            <p className="text-xs text-muted-foreground mt-1">记录数</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatBytes(totalSize)}</p>
            <p className="text-xs text-muted-foreground mt-1">数据大小</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{formatBytes(nfcData.maxSize)}</p>
            <p className="text-xs text-muted-foreground mt-1">最大容量</p>
          </div>
        </div>
      )}

      {importError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{importError}</p>
        </div>
      )}

      {nfcData && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 py-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 hover:bg-destructive/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="font-medium">清空数据</span>
        </button>
      )}

      <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
        <p className="text-xs text-muted-foreground leading-relaxed">
          数据文件格式：JSON，包含NFC标签的完整信息，可用于备份和恢复。支持导入之前导出的.nfc文件。
        </p>
      </div>
    </div>
  );
}
