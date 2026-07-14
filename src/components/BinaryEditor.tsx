'use client';

import { useState, useCallback, useEffect } from 'react';
import { Code, Hexagon, Type, Plus, Trash2 } from 'lucide-react';
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
            <span className="w-16 text-gray-500">{(i * 16).toString(16).padStart(4, '0')}</span>
            <span className="ml-4">{line.match(/.{2}/g)?.join(' ') || ''}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-nfc-light rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Code className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">二进制编辑器</h3>
            <p className="text-sm text-gray-400">编辑NFC数据</p>
          </div>
        </div>
        <button
          onClick={handleAddRecord}
          className="flex items-center gap-2 px-3 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">添加记录</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无数据，请先读取或导入NFC标签</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {records.map((record, index) => (
              <div
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                  selectedIndex === index
                    ? 'bg-primary-500 text-white'
                    : 'bg-nfc-dark text-gray-300 hover:bg-nfc-dark/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">记录 {index + 1}</span>
                  {records.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecord(index);
                      }}
                      className="text-xs hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-xs opacity-70">
                  {getRecordTypeName(record.recordType)}
                </div>
              </div>
            ))}
          </div>

          {currentRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-400">记录类型</label>
                <select
                  value={currentRecord.recordType}
                  onChange={(e) => handleRecordTypeChange(selectedIndex, e.target.value)}
                  className="bg-nfc-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="text">文本</option>
                  <option value="url">URL</option>
                  <option value="mime">MIME类型</option>
                  <option value="smart-poster">智能海报</option>
                  <option value="empty">空记录</option>
                </select>
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
                    className="bg-nfc-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewMode('hex');
                    setEditedData(uint8ArrayToHex(currentRecord.data));
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    viewMode === 'hex'
                      ? 'bg-primary-500 text-white'
                      : 'bg-nfc-dark text-gray-400 hover:bg-nfc-dark/80'
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
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    viewMode === 'text'
                      ? 'bg-primary-500 text-white'
                      : 'bg-nfc-dark text-gray-400 hover:bg-nfc-dark/80'
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
                  className="w-full h-48 bg-nfc-dark border border-gray-700 rounded-xl p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {currentRecord.data.length} 字节
                </div>
              </div>

              <div className="bg-nfc-dark rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">数据预览</p>
                {viewMode === 'hex' ? (
                  <pre className="max-h-32 overflow-auto">{renderHexView(currentRecord.data)}</pre>
                ) : (
                  <pre className="max-h-32 overflow-auto text-primary-300">{uint8ArrayToString(currentRecord.data)}</pre>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
