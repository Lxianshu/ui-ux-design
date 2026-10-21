import { useEffect } from 'react';
import type { SimulationStatus } from '../cases/types';

interface SimulationOptions {
  status: SimulationStatus;
  durationMs: number;
  failAt?: number;
  onProgress: (progress: number) => void;
  onFinish: (failed: boolean) => void;
}

/** 仅负责模拟时钟；状态由调用者管理，重置或卸载会取消帧回调。 */
export function useSimulation({
  status,
  durationMs,
  failAt,
  onProgress,
  onFinish,
}: SimulationOptions) {
  useEffect(() => {
    if (status !== 'running') return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      onProgress(Math.min(progress, failAt ?? 1));
      if (progress >= (failAt ?? 1)) onFinish(failAt !== undefined);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, durationMs, failAt, onProgress, onFinish]);
}
