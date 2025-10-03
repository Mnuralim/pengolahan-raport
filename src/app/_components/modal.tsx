"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100000000] flex items-start justify-center bg-slate-900/20 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 shadow-lg rounded-lg relative transition-all duration-300 ease-in-out mt-8
                 max-h-[calc(100vh-4rem)] overflow-y-auto"
      >
        <button
          onClick={handleClose}
          className="sticky top-4 float-right mr-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200 transition-colors duration-200 z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 pt-6 clear-both">{children}</div>
      </div>
    </div>
  );
};
