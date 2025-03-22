import { useEffect } from 'react';

import { useStore } from '@wsh-2025/client/src/app/StoreContext';


/**
 * setImmediate のブラウザ向けポリフィル。
 * Node.js の setImmediate と同じ引数構造をエミュレートしている。
 */
export function timeoutForSetImmediate(
  handler: (...args: any[]) => void,
  ...args: any[]
): number {
  // setTimeout の第3引数以降をコールバック関数に引き渡せる
  return window.setTimeout(handler, 0, ...args);
}

/**
 * clearImmediate のブラウザ向けポリフィル。
 * setImmediate の戻り値を受け取って、clearTimeout でキャンセルする。
 */
export function clearTimeoutForSetImmediate(handle: number): void {
  window.clearTimeout(handle);
}

export function useSubscribePointer(): void {
  const s = useStore((s) => s);

  useEffect(() => {
    const abortController = new AbortController();

    const current = { x: 0, y: 0 };
    const handlePointerMove = (ev: MouseEvent) => {
      current.x = ev.clientX;
      current.y = ev.clientY;
    };
    window.addEventListener('pointermove', handlePointerMove, { signal: abortController.signal, passive: true });

    let immediate = timeoutForSetImmediate(function tick() {
      s.features.layout.updatePointer({ ...current });
      immediate = timeoutForSetImmediate(tick);
    });
    abortController.signal.addEventListener('abort', () => {
      clearTimeoutForSetImmediate(immediate);
    });

    return () => {
      abortController.abort();
    };
  }, []);
}
