"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./common");
const wakatime_1 = require("./api/wakatime");
const cosmic_1 = require("@anandchowdhary/cosmic");
(async () => {
    if (cosmic_1.config("weekly").includes("wakatime"))
        await wakatime_1.weekly();
})();
