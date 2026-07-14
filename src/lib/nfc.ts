interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  data: DataView | Uint8Array;
  encoding?: string;
  lang?: string;
}

interface NDEFReadingEvent {
  serialNumber?: string;
  records: NDEFRecord[];
  id?: string;
  techType?: string;
  maxSize?: number;
}

interface NDEFReader {
  scan(options?: { signal?: AbortSignal }): Promise<NDEFReadingEvent>;
  onreading?: (event: NDEFReadingEvent) => void;
  onreadingerror?: (event: Event) => void;
}

interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  data?: string | Uint8Array | ArrayBuffer | DataView;
  encoding?: string;
  lang?: string;
}

interface NDEFWriter {
  write(records: NDEFRecordInit | NDEFRecordInit[], options?: { signal?: AbortSignal }): Promise<void>;
}

declare global {
  interface Window {
    NDEFReader: {
      new (): NDEFReader;
    };
    NDEFWriter: {
      new (): NDEFWriter;
    };
  }
}

export interface NFCData {
  id: string;
  records: NFCRecord[];
  techType: string;
  maxSize: number;
}

export interface NFCRecord {
  recordType: string;
  mediaType?: string;
  data: Uint8Array;
  encoding?: string;
  lang?: string;
}

interface NFCFileRecord {
  recordType: string;
  mediaType?: string;
  data: number[];
  encoding?: string;
  lang?: string;
}

interface NFCFileNFCData {
  id: string;
  records: NFCFileRecord[];
  techType: string;
  maxSize: number;
}

export interface NFCFileData {
  version: string;
  createdAt: string;
  nfcData: NFCFileNFCData;
}

export function isNFCSupported(): boolean {
  return 'NDEFReader' in window;
}

export async function readNFC(): Promise<NFCData> {
  if (!isNFCSupported()) {
    throw new Error('您的浏览器不支持WebNFC功能');
  }

  const reader = new window.NDEFReader();
  
  try {
    const tag = await reader.scan();
    
    const records: NFCRecord[] = [];
    for (const record of tag.records) {
      let data: Uint8Array;
      if (record.data instanceof Uint8Array) {
        data = record.data;
      } else {
        data = new Uint8Array(record.data.buffer, record.data.byteOffset, record.data.byteLength);
      }
      
      records.push({
        recordType: record.recordType,
        mediaType: record.mediaType,
        data,
        encoding: record.encoding,
        lang: record.lang,
      });
    }

    return {
      id: tag.id || '',
      records,
      techType: tag.techType || '',
      maxSize: tag.maxSize || 0,
    };
  } catch (error) {
    throw error;
  }
}

export async function writeNFC(records: NFCRecord[]): Promise<void> {
  if (!isNFCSupported()) {
    throw new Error('您的浏览器不支持WebNFC功能');
  }

  const writer = new window.NDEFWriter();
  
  const ndefRecords: NDEFRecordInit[] = records.map((record) => ({
    recordType: record.recordType,
    mediaType: record.mediaType,
    data: record.data,
    encoding: record.encoding,
    lang: record.lang,
  }));

  try {
    await writer.write(ndefRecords);
  } catch (error) {
    throw error;
  }
}

export function uint8ArrayToHex(array: Uint8Array): string {
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToUint8Array(hex: string): Uint8Array {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

export function uint8ArrayToString(array: Uint8Array, encoding: string = 'utf-8'): string {
  try {
    return new TextDecoder(encoding).decode(array);
  } catch {
    return uint8ArrayToHex(array);
  }
}

export function stringToUint8Array(str: string, encoding: string = 'utf-8'): Uint8Array {
  return new TextEncoder().encode(str);
}

export function exportToFile(nfcData: NFCData, filename: string = 'nfc-data.json'): void {
  const fileData: NFCFileData = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    nfcData: {
      ...nfcData,
      records: nfcData.records.map((record) => ({
        ...record,
        data: Array.from(record.data),
      })),
    },
  };

  const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromFile(file: File): Promise<NFCData> {
  const text = await file.text();
  const fileData: NFCFileData = JSON.parse(text);

  return {
    ...fileData.nfcData,
    records: fileData.nfcData.records.map((record) => ({
      ...record,
      data: new Uint8Array(record.data as number[]),
    })),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getRecordTypeName(type: string): string {
  const types: Record<string, string> = {
    'text': '文本',
    'url': 'URL',
    'mime': 'MIME类型',
    'smart-poster': '智能海报',
    'empty': '空记录',
    'unknown': '未知类型',
  };
  return types[type] || type;
}
