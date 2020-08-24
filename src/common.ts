import { cosmicSync } from "@anandchowdhary/cosmic";
import { ensureFile, writeFile } from "fs-extra";
cosmicSync("life");

export const write = async (name: string, contents: any) => {
  await ensureFile(name);
  await writeFile(name, contents);
};

export const zero = (num: string) => (parseInt(num) > 9 ? num : `0${num}`);
