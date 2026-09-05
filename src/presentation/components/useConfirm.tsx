import { useCallback, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useConfirm() {
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  const modal = (
    <ConfirmModal
      open={Boolean(options)}
      title={options?.title}
      message={options?.message || ""}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { confirm, modal };
}
