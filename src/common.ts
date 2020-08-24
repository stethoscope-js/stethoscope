import { cosmicSync } from "@anandchowdhary/cosmic";
import { ensureFile, writeFile } from "fs-extra";
cosmicSync("life");

export const write = async (name: string, contents: any) => {
  await ensureFile(name);
  await writeFile(name, contents);
};
