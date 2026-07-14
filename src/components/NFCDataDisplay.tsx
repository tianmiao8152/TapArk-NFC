'use client';

import { Tag, Hash, Layers, FileText, Link2 } from 'lucide-react';
import { uint8ArrayToString, uint8ArrayToHex, formatBytes, getRecordTypeName, type NFCData } from '@/lib/nfc';

interface NFCDataDisplayProps {
  data: NFCData;
}

export default function NFCDataDisplay({ data }: NFCDataDisplayProps) {
  const totalSize = data.records.reduce((acc, record) => acc + record.data.length, 0);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <Tag className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">NFC 数据详情</h3>
          <p className="text-sm text-muted-foreground">标签信息与记录内容</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Hash className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold">{data.id ? data.id.slice(0, 8) : '未知'}</p>
            <p className="text-xs text-muted-foreground mt-1">标签ID</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Layers className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-bold">{data.techType || 'NDEF'}</p>
            <p className="text-xs text-muted-foreground mt-1">技术类型</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <FileText className="w-5 h-5 text-orange-600 mx-auto mb-2" />
            <p className="text-lg font-bold">{formatBytes(totalSize)}</p>
            <p className="text-xs text-muted-foreground mt-1">数据大小</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              NDEF 记录 ({data.records.length})
            </h4>
          </div>
          <div className="space-y-3">
            {data.records.map((record, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">记录 {index + 1}</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {getRecordTypeName(record.recordType)}
                  </span>
                </div>

                <div className="space-y-3">
                  {record.mediaType && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">MIME类型</span>
                      <span className="font-mono text-xs">{record.mediaType}</span>
                    </div>
                  )}

                  {record.lang && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">语言</span>
                      <span>{record.lang}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">数据大小</span>
                    <span>{formatBytes(record.data.length)}</span>
                  </div>

                  <div className="bg-background rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {record.recordType === 'url' ? (
                        <Link2 className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground">内容</span>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap font-mono break-all leading-relaxed">
                      {uint8ArrayToString(record.data)}
                    </pre>
                    {record.data.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">十六进制</p>
                        <pre className="text-xs text-muted-foreground font-mono break-all leading-relaxed">
                          {uint8ArrayToHex(record.data)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
