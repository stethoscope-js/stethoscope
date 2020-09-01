"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./common");
const cosmic_1 = require("@anandchowdhary/cosmic");
const google_fit_1 = require("./api/google-fit");
(async () => {
    if (cosmic_1.config("daily").includes("googleFit"))
        await google_fit_1.summary();
})();
