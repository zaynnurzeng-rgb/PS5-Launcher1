// Hex editor & binary inspection utility

export function calculateCRC32(data: string): string {
  let crc = -1;
  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i);
    crc = (crc >>> 8) ^ table[(crc ^ code) & 0xff];
  }
  return ('00000000' + ((crc ^ -1) >>> 0).toString(16).toUpperCase()).slice(-8);
}

// Precomputed table for fast CRC32
const table: number[] = (() => {
  let c: number;
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c;
  }
  return t;
})();

export interface HexRow {
  offset: string;
  bytes: string[];
  ascii: string;
}

export function generateHexDump(hexString: string): HexRow[] {
  // hexString is continuous 2-character hex pairs e.g. "414243..."
  const cleanHex = hexString.replace(/[^0-9A-Fa-f]/g, '');
  const rows: HexRow[] = [];
  const bytesPerLine = 16;

  for (let i = 0; i < cleanHex.length; i += bytesPerLine * 2) {
    const slice = cleanHex.slice(i, i + bytesPerLine * 2);
    const bytes: string[] = [];
    let ascii = '';

    for (let j = 0; j < slice.length; j += 2) {
      const byteHex = slice.substr(j, 2);
      bytes.push(byteHex);
      const byteVal = parseInt(byteHex, 16);
      if (byteVal >= 32 && byteVal <= 126) {
        ascii += String.fromCharCode(byteVal);
      } else {
        ascii += '·';
      }
    }

    const offsetVal = (i / 2).toString(16).padStart(8, '0').toUpperCase();
    rows.push({
      offset: offsetVal,
      bytes,
      ascii,
    });
  }

  return rows;
}

export function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

export function hexToString(hex: string): string {
  const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
  let str = '';
  for (let i = 0; i < cleanHex.length; i += 2) {
    str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
  }
  return str;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}
