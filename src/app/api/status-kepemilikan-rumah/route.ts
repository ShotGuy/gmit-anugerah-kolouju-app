import { createMasterCollectionHandlers } from "@/server/master";

export const { GET, POST } =
  createMasterCollectionHandlers("status-kepemilikan-rumah");

