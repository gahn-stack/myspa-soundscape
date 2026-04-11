import { useSoundscapeStore } from '@/stores/soundscape.store';

export function useShareUrl() {
  const store = useSoundscapeStore();

  function generateShareUrl(): string {
    const params = store.toUrlParams();
    const base = window.location.origin + window.location.pathname;
    return `${base}?${params}`;
  }

  async function copyToClipboard(): Promise<boolean> {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }

  async function nativeShare(): Promise<boolean> {
    if (!navigator.share) return false;
    try {
      await navigator.share({
        url: generateShareUrl(),
      });
      return true;
    } catch {
      return false;
    }
  }

  function hasNativeShare(): boolean {
    return typeof navigator.share === 'function';
  }

  return { generateShareUrl, copyToClipboard, nativeShare, hasNativeShare };
}
