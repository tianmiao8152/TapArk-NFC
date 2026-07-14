'use client';

import { Tag, Hash, Layers, FileText, Link2 } from 'lucide-react';
import { uint8ArrayToString, uint8ArrayToHex, formatBytes, getRecordTypeName, type NFCData } from '@/lib/nfc';

interface NFCDataDisplayProps {
  data: NFCData;
}

export default function NFCDataDisplay({ data }: NFCDataDisplayProps) {
  return (
    <div className="bg-nfc-light rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <Tag className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">NFC 数据详情</h3>
          <p className="text-sm text-gray-400">标签信息与记录内容</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-nfc-dark rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-primary-400" />
              <span className="text-sm text-gray-400">标签ID</span>
            </div>
            <span className="font-mono text-sm text-primary-300">{data.id || '未知'}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">技术类型</span>
            </div>
            <span className="text-sm text-green-300">{data.techType || 'NDEF'}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-400">最大容量</span>
            </div>
            <span className="text-sm text-orange-300">{formatBytes(data.maxSize)}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">NDEF 记录 ({data.records.length})</h4>
          <div className="space-y-3">
            {data.records.map((record, index) => (
              <div key={index} className="bg-nfc-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">记录 {index + 1}</span>
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                    {getRecordTypeName(record.recordType)}
                  </span>
                </div>
                
                {record.mediaType && (
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">MIME类型</span>
                    <span className="text-gray-300">{record.mediaType}</span>
                  </div>
                )}
                
                {record.lang && (
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">语言</span>
                    <span className="text-gray-300">{record.lang}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-400">数据大小</span>
                  <span className="text-gray-300">{formatBytes(record.data.length)}</span>
                </div>

                <div className="bg-nfc-light rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {record.recordType === 'url' ? (
                      <Link2 className="w-4 h-4 text-primary-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary-400" />
                    )}
                    <span className="text-xs text-gray-400">内容</span>
                  </div>
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono break-all">
                    {uint8ArrayToString(record.data)}
                  </pre>
                  {record.data.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">十六进制</p>
                      <pre className="text-xs text-gray-400 font-mono break-all">
                        {uint8ArrayToHex(record.data)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
