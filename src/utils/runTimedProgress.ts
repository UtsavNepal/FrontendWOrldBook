export function runTimedProgress(
  durationMs: number,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    let percent = 1;
    onProgress(1);
    const interval = durationMs / 99;
    const timer = window.setInterval(() => {
      percent += 1;
      if (percent >= 100) {
        window.clearInterval(timer);
        onProgress(100);
        resolve();
      } else {
        onProgress(percent);
      }
    }, interval);
  });
}
