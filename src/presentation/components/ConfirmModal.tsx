import React from "react";

export interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="wb-card w-full max-w-md p-5">
        <h2 className="mb-2 text-lg font-bold">{title}</h2>
        <p className="mb-5 text-sm text-wb-muted">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="wb-btn-secondary font-bold" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="wb-btn-danger font-bold" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
