import { createMasterCollectionHandlers } from "@/server/master";

export const { GET, POST } =
  createMasterCollectionHandlers("jaminan-kesehatan");

