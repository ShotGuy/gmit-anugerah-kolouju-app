import { customAlphabet } from "nanoid";

const alphaNumeric = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  16,
);

export const generateId = (length = 16) =>
  customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length)();

export const generateJemaatId = () => alphaNumeric();

