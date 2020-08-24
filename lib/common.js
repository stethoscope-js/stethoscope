"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zero = exports.write = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const fs_extra_1 = require("fs-extra");
cosmic_1.cosmicSync("life");
exports.write = async (name, contents) => {
    await fs_extra_1.ensureFile(name);
    await fs_extra_1.writeFile(name, contents);
};
exports.zero = (num) => (parseInt(num) > 9 ? num : `0${num}`);
