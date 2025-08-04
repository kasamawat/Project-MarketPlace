import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = "Confirm",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow p-6 w-full max-w-sm">
        <div className="font-semibold text-lg mb-4 text-white">{title}</div>
        <div className="mb-6 text-red-700">{message}</div>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            type="button"
          >
            {confirmText}
          </button>
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
