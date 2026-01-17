import { useState } from "react";

export default function useDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  const open = (data) => {
    setData(data);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setData(null);
  };

  return {
    isOpen,
    data,
    open,
    close,
  };
}
