import { createMasterDetailHandlers } from "@/server/master";

export const { GET, PATCH, DELETE } =
  createMasterDetailHandlers("status-tanah");

