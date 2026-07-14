'use client';

import { useState, useRef } from 'react';
import { Download, Upload, FileJson, RefreshCw } from 'lucide-react';
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
    <div className="bg-nfc-light rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <FileJson className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">数据管理</h3>
            <p className="text-sm text-gray-400">导入/导出NFC数据</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={handleExport}
          disabled={!nfcData || nfcData.records.length === 0}
          className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-all ${
            nfcData && nfcData.records.length > 0
              ? 'bg-primary-500 hover:bg-primary-600 active:scale-95'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <Download className="w-6 h-6" />
          <span className="text-sm font-medium">导出数据</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-all ${
            importing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 active:scale-95'
          }`}
        >
          <Upload className="w-6 h-6" />
          <span className="text-sm font-medium">导入数据</span>
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
        <div className="bg-nfc-dark rounded-xl p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-400">{nfcData.records.length}</p>
              <p className="text-xs text-gray-400">记录数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{formatBytes(totalSize)}</p>
              <p className="text-xs text-gray-400">数据大小</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{formatBytes(nfcData.maxSize)}</p>
              <p className="text-xs text-gray-400">最大容量</p>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <p className="text-sm text-red-400 mb-4">{importError}</p>
      )}

      {nfcData && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>清空数据</span>
        </button>
      )}

      <div className="mt-4 p-4 bg-gray-500/10 rounded-xl">
        <p className="text-xs text-gray-400">
          数据文件格式：JSON，包含NFC标签的完整信息，可用于备份和恢复。
          支持导入之前导出的.nfc文件。
        </p>
      </div>
    </div>
  );
}
