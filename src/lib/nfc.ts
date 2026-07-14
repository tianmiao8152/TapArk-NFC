interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  data?: string | Uint8Array | ArrayBuffer | DataView;
  encoding?: string;
  lang?: string;
}

interface NDEFWriter {
  write(message: any, options?: { overwrite?: boolean; signal?: AbortSignal }): Promise<void>;
}

interface NDEFReadingEvent extends Event {
  serialNumber?: string;
  message: {
    records: Array<{
      recordType: string;
      mediaType?: string;
      id?: string;
      data: DataView;
      encoding?: string;
      lang?: string;
    }>;
  };
}

interface NFCReader {
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  write(
    message: { records: NDEFRecordInit[] },
    options?: { overwrite?: boolean; signal?: AbortSignal }
  ): Promise<void>;
  makeReadOnly(options?: { signal?: AbortSignal }): Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
}

declare global {
  interface Window {
    NDEFReader: {
      new (): NFCReader;
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

  return new Promise((resolve, reject) => {
    let isResolved = false;

    reader.onreading = (event: NDEFReadingEvent) => {
      if (isResolved) return;
      isResolved = true;

      const records: NFCRecord[] = [];

      for (const record of event.message.records) {
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

      resolve({
        id: event.serialNumber || '',
        records,
        techType: 'NDEF',
        maxSize: 0,
      });
    };

    reader.onreadingerror = (event: Event) => {
      if (isResolved) return;
      isResolved = true;
      reject(new Error('无法读取NFC标签数据，请尝试其他标签'));
    };

    reader.scan().catch((error) => {
      if (isResolved) return;
      isResolved = true;
      reject(error);
    });
  });
}

export async function writeNFC(records: NFCRecord[]): Promise<void> {
  if (!isNFCSupported()) {
    throw new Error('您的浏览器不支持WebNFC功能');
  }

  const writer = new window.NDEFWriter();

  const cleanedRecords = records.map((record) => {
    const cleaned: NDEFRecordInit = {
      recordType: record.recordType,
      encoding: record.encoding,
      lang: record.lang,
    };

    if (record.mediaType) {
      cleaned.mediaType = record.mediaType;
    }

    if (record.data instanceof Uint8Array) {
      cleaned.data = record.data;
    } else {
      cleaned.data = record.data;
    }

    return cleaned;
  });

  try {
    await writer.write({ records: cleanedRecords });
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
      id: nfcData.id,
      records: nfcData.records.map((record) => ({
        recordType: record.recordType,
        mediaType: record.mediaType,
        data: Array.from(record.data),
        encoding: record.encoding,
        lang: record.lang,
      })),
      techType: nfcData.techType,
      maxSize: nfcData.maxSize,
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
    id: fileData.nfcData.id,
    records: fileData.nfcData.records.map((record) => ({
      recordType: record.recordType,
      mediaType: record.mediaType,
      data: new Uint8Array(record.data),
      encoding: record.encoding,
      lang: record.lang,
    })),
    techType: fileData.nfcData.techType,
    maxSize: fileData.nfcData.maxSize,
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
