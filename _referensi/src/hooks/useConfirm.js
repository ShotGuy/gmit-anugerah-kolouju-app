import { useState } from "react";

export default function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: "Konfirmasi",
    message: "Apakah Anda yakin ingin melanjutkan?",
    confirmText: "Ya, Lanjutkan",
    cancelText: "Batal",
    variant: "danger",
    onConfirm: () => {},
  });

  const showConfirm = (options = {}) => {
    setConfig({
      title: options.title || "Konfirmasi",
      message: options.message || "Apakah Anda yakin ingin melanjutkan?",
      confirmText: options.confirmText || "Ya, Lanjutkan",
      cancelText: options.cancelText || "Batal", 
      variant: options.variant || "danger",
      onConfirm: options.onConfirm || (() => {}),
    });
    setIsOpen(true);
  };

  const hideConfirm = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    config.onConfirm();
    hideConfirm();
  };

  return {
    isOpen,
    config,
    showConfirm,
    hideConfirm,
    handleConfirm,
  };
}