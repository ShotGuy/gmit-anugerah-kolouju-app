"use client";

import { Toaster } from "sonner";

export const AppToaster = () => (
  <Toaster
    richColors
    expand={false}
    position="top-right"
    closeButton
  />
);

