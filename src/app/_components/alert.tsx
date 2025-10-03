"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface AlertProps {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
  isVisible: boolean;
}

export const Alert = ({
  type,
  message,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  className = "",
  isVisible = false,
}: AlertProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAlert, setShowAlert] = useState(isVisible);
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(false);
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [isVisible, message, type]);

  useEffect(() => {
    if (autoClose && showAlert && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoClose, autoCloseDelay, showAlert, message, type]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowAlert(false);
      router.replace(pathName);
      onClose?.();
    }, 200);
  };

  console.log("Alert state:", { isVisible, showAlert, message, type });

  if (!showAlert) {
    return null;
  }

  const alertStyles = {
    success: {
      container: "bg-green-50 border border-green-100",
      icon: "text-green-600",
      title: "text-green-800",
      message: "text-green-700",
      closeButton: "text-green-600 hover:text-green-800 hover:bg-green-100",
    },
    error: {
      container: "bg-red-50 border border-red-100",
      icon: "text-red-600",
      title: "text-red-800",
      message: "text-red-700",
      closeButton: "text-red-600 hover:text-red-800 hover:bg-red-100",
    },
  };

  const currentStyle = alertStyles[type];
  const Icon = type === "success" ? CheckCircle : XCircle;
  const title = type === "success" ? "Berhasil!" : "Error!";

  return (
    <div
      className="fixed top-4 right-4 z-[99999999]
        flex flex-col space-y-3"
    >
      <div
        className={`
        ${currentStyle.container}
        rounded-lg p-4 shadow-sm
        transition-all duration-200 ease-in-out
        ${
          isAnimating
            ? "opacity-0 transform translate-y-[-8px] scale-95"
            : "opacity-100 transform translate-y-0 scale-100"
        }
        ${className}
      `}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${currentStyle.icon}`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${currentStyle.title}`}>
              {title}
            </h3>
            <p className={`text-sm mt-1 ${currentStyle.message}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`
              inline-flex rounded-lg p-1.5 transition-colors duration-200
              ${currentStyle.closeButton}
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                type === "success"
                  ? "focus:ring-green-500"
                  : "focus:ring-red-500"
              }
            `}
              aria-label="Tutup alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
