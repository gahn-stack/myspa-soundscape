const SCHEMA_VERSION = 1;

export function encodeSoundscapeState(
  masterVolume: number,
  trackVolumes: Record<string, number>,
  trackOrder: string[],
): string {
  const bytes = new Uint8Array(1 + trackOrder.length);
  bytes[0] = Math.round(masterVolume * 100);
  for (let i = 0; i < trackOrder.length; i++) {
    bytes[i + 1] = Math.round((trackVolumes[trackOrder[i]] ?? 0) * 100);
  }
  return `v=${SCHEMA_VERSION}&s=${base64UrlEncode(bytes)}`;
}

export function decodeSoundscapeState(
  searchParams: URLSearchParams,
  trackOrder: string[],
): { masterVolume: number; trackVolumes: Record<string, number> } | null {
  const version = searchParams.get('v');
  const encoded = searchParams.get('s');
  if (version !== String(SCHEMA_VERSION) || !encoded) return null;

  try {
    const bytes = base64UrlDecode(encoded);
    if (bytes.length < 1 + trackOrder.length) return null;
    const masterVolume = bytes[0] / 100;
    const trackVolumes: Record<string, number> = {};
    for (let i = 0; i < trackOrder.length; i++) {
      trackVolumes[trackOrder[i]] = bytes[i + 1] / 100;
    }
    return { masterVolume, trackVolumes };
  } catch {
    return null;
  }
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
