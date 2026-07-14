'use client';

import { useState, useCallback, useEffect } from 'react';
import { Code, Hexagon, Type, Plus, Trash2, Copy, Check } from 'lucide-react';
import {
  uint8ArrayToHex,
  hexToUint8Array,
  uint8ArrayToString,
  stringToUint8Array,
  getRecordTypeName,
  type NFCRecord,
} from '@/lib/nfc';

interface BinaryEditorProps {
  records: NFCRecord[];
  onUpdate: (records: NFCRecord[]) => void;
}

type ViewMode = 'hex' | 'text';

export default function BinaryEditor({ records, onUpdate }: BinaryEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('hex');
  const [editedData, setEditedData] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentRecord = records[selectedIndex];

  const handleRecordChange = useCallback(() => {
    if (!currentRecord) return;

    try {
      let data: Uint8Array;
      if (viewMode === 'hex') {
        const cleanHex = editedData.replace(/[^0-9a-fA-F]/g, '');
        data = hexToUint8Array(cleanHex);
      } else {
        data = stringToUint8Array(editedData);
      }

      const newRecords = [...records];
      newRecords[selectedIndex] = { ...currentRecord, data };
      onUpdate(newRecords);
    } catch {
      console.error('数据格式错误');
    }
  }, [currentRecord, editedData, viewMode, records, selectedIndex, onUpdate]);

  const handleAddRecord = () => {
    const newRecord: NFCRecord = {
      recordType: 'text',
      data: new Uint8Array(),
      lang: 'zh',
      encoding: 'utf-8',
    };
    onUpdate([...records, newRecord]);
    setSelectedIndex(records.length);
    setEditedData('');
  };

  const handleDeleteRecord = (index: number) => {
    if (records.length <= 1) return;
    const newRecords = records.filter((_, i) => i !== index);
    onUpdate(newRecords);
    setSelectedIndex(Math.min(selectedIndex, newRecords.length - 1));
    setEditedData(currentRecord ? uint8ArrayToHex(currentRecord.data) : '');
  };

  const handleRecordTypeChange = (index: number, type: string) => {
    const newRecords = [...records];
    newRecords[index] = { ...newRecords[index], recordType: type };
    onUpdate(newRecords);
  };

  const handleCopy = async () => {
    if (!currentRecord) return;
    try {
      await navigator.clipboard.writeText(viewMode === 'hex' ? uint8ArrayToHex(currentRecord.data) : uint8ArrayToString(currentRecord.data));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('复制失败');
    }
  };

  useEffect(() => {
    if (currentRecord) {
      if (viewMode === 'hex') {
        setEditedData(uint8ArrayToHex(currentRecord.data));
      } else {
        setEditedData(uint8ArrayToString(currentRecord.data));
      }
    }
  }, [currentRecord, viewMode]);

  const renderHexView = (data: Uint8Array) => {
    const hex = uint8ArrayToHex(data);
    const lines: string[] = [];
    for (let i = 0; i < hex.length; i += 32) {
      lines.push(hex.slice(i, i + 32));
    }

    return (
      <div className="font-mono text-sm text-primary-300">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-16 text-muted-foreground">{(i * 16).toString(16).padStart(4, '0')}</span>
            <span className="ml-4">{line.match(/.{2}/g)?.join(' ') || ''}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border border-purple-500/20">
            <Code className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">二进制编辑器</h3>
            <p className="text-sm text-muted-foreground">编辑NFC数据</p>
          </div>
        </div>
        <button
          onClick={handleAddRecord}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">添加记录</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="py-16 text-center">
          <Code className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">暂无数据，请先读取或导入NFC标签</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {records.map((record, index) => (
              <div
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedIndex === index
                    ? 'bg-primary/20 border-primary/50 text-white'
                    : 'bg-secondary/50 border-white/5 text-muted-foreground hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-sm">记录 {index + 1}</span>
                  {records.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecord(index);
                      }}
                      className="text-xs hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {getRecordTypeName(record.recordType)}
                </div>
              </div>
            ))}
          </div>

          {currentRecord && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">记录类型</label>
                  <select
                    value={currentRecord.recordType}
                    onChange={(e) => handleRecordTypeChange(selectedIndex, e.target.value)}
                    className="bg-secondary border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="text">文本</option>
                    <option value="url">URL</option>
                    <option value="mime">MIME类型</option>
                    <option value="smart-poster">智能海报</option>
                    <option value="empty">空记录</option>
                  </select>
                </div>
                {currentRecord.mediaType && (
                  <input
                    type="text"
                    value={currentRecord.mediaType}
                    onChange={(e) => {
                      const newRecords = [...records];
                      newRecords[selectedIndex] = { ...newRecords[selectedIndex], mediaType: e.target.value };
                      onUpdate(newRecords);
                    }}
                    placeholder="MIME类型"
                    className="bg-secondary border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setViewMode('hex');
                    setEditedData(uint8ArrayToHex(currentRecord.data));
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    viewMode === 'hex'
                      ? 'bg-primary text-white'
                      : 'bg-secondary/50 text-muted-foreground border border-white/5 hover:border-white/10'
                  }`}
                >
                  <Hexagon className="w-4 h-4" />
                  <span>十六进制</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('text');
                    setEditedData(uint8ArrayToString(currentRecord.data));
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    viewMode === 'text'
                      ? 'bg-primary text-white'
                      : 'bg-secondary/50 text-muted-foreground border border-white/5 hover:border-white/10'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>文本</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={editedData}
                  onChange={(e) => setEditedData(e.target.value)}
                  onBlur={handleRecordChange}
                  placeholder={viewMode === 'hex' ? '输入十六进制数据...' : '输入文本数据...'}
                  className="w-full h-48 bg-secondary/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{currentRecord.data.length} 字节</span>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="glass-card-hover p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">数据预览</p>
                {viewMode === 'hex' ? (
                  <div className="max-h-32 overflow-auto rounded-lg bg-secondary/30 p-3">
                    {renderHexView(currentRecord.data)}
                  </div>
                ) : (
                  <pre className="max-h-32 overflow-auto text-primary-300 whitespace-pre-wrap break-all leading-relaxed">
                    {uint8ArrayToString(currentRecord.data)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
