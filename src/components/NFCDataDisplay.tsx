'use client';

import { Tag, Hash, Layers, FileText, Link2, Copy } from 'lucide-react';
import { uint8ArrayToString, uint8ArrayToHex, formatBytes, getRecordTypeName, type NFCData } from '@/lib/nfc';

interface NFCDataDisplayProps {
  data: NFCData;
}

export default function NFCDataDisplay({ data }: NFCDataDisplayProps) {
  const totalSize = data.records.reduce((acc, record) => acc + record.data.length, 0);

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/20">
          <Tag className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">NFC 数据详情</h3>
          <p className="text-sm text-muted-foreground">标签信息与记录内容</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card-hover p-4 text-center">
            <Hash className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{data.id ? data.id.slice(0, 8) : '未知'}</p>
            <p className="text-xs text-muted-foreground mt-1">标签ID</p>
          </div>
          <div className="glass-card-hover p-4 text-center">
            <Layers className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{data.techType || 'NDEF'}</p>
            <p className="text-xs text-muted-foreground mt-1">技术类型</p>
          </div>
          <div className="glass-card-hover p-4 text-center">
            <FileText className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{formatBytes(totalSize)}</p>
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
              <div key={index} className="glass-card-hover p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-white">记录 {index + 1}</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                    {getRecordTypeName(record.recordType)}
                  </span>
                </div>

                <div className="space-y-3">
                  {record.mediaType && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">MIME类型</span>
                      <span className="text-white font-mono text-xs">{record.mediaType}</span>
                    </div>
                  )}

                  {record.lang && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">语言</span>
                      <span className="text-white">{record.lang}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">数据大小</span>
                    <span className="text-white">{formatBytes(record.data.length)}</span>
                  </div>

                  <div className="bg-secondary/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      {record.recordType === 'url' ? (
                        <Link2 className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground">内容</span>
                    </div>
                    <pre className="text-sm text-white whitespace-pre-wrap font-mono break-all leading-relaxed">
                      {uint8ArrayToString(record.data)}
                    </pre>
                    {record.data.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">十六进制</p>
                          <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                            复制
                          </button>
                        </div>
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
