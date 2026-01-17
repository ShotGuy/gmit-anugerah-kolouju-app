import { useState } from "react";

export default function useModalForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const open = (data = null) => {
    setEditData(data);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditData(null);
  };

  return {
    isOpen,
    editData,
    open,
    close,
  };
}
