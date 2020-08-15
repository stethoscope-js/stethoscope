"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zero = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
cosmic_1.cosmicSync("life");
exports.zero = (num) => (parseInt(num) > 9 ? num : `0${num}`);
