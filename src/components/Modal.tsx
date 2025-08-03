// components/Modal.tsx
import React from "react";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    onClick={onClose}
  >
    <div
      className="bg-gray-900 rounded-xl p-8 min-w-[360px] max-w-3xl w-full shadow-lg relative max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <button
        className="absolute top-3 right-3 text-xl cursor-pointer"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  </div>
);

export default Modal;
