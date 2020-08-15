import { cosmicSync } from "@anandchowdhary/cosmic";
cosmicSync("life");

export const zero = (num: string) => (parseInt(num) > 9 ? num : `0${num}`);
