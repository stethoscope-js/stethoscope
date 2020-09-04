"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./common");
const cosmic_1 = require("@anandchowdhary/cosmic");
const spotify_1 = require("./api/spotify");
const rescuetime_1 = require("./api/rescuetime");
const last_fm_1 = require("./api/last-fm");
const pocket_casts_1 = require("./api/pocket-casts");
const wakatime_1 = require("./api/wakatime");
const clockify_1 = require("./api/clockify");
const google_fit_1 = require("./api/google-fit");
const oura_ring_1 = require("./api/oura-ring");
const goodreads_1 = require("./api/goodreads");
(async () => {
    if (cosmic_1.config("daily").includes("spotify"))
        await spotify_1.daily();
    if (cosmic_1.config("daily").includes("rescueTime"))
        await rescuetime_1.daily();
    if (cosmic_1.config("daily").includes("pocketCasts"))
        await pocket_casts_1.daily();
    if (cosmic_1.config("daily").includes("wakatime"))
        await wakatime_1.daily();
    if (cosmic_1.config("daily").includes("lastFm"))
        await last_fm_1.daily();
    if (cosmic_1.config("daily").includes("clockify"))
        await clockify_1.daily();
    if (cosmic_1.config("daily").includes("googleFit"))
        await google_fit_1.daily();
    if (cosmic_1.config("daily").includes("ouraRing"))
        await oura_ring_1.daily();
    if (cosmic_1.config("daily").includes("goodreads"))
        await goodreads_1.daily();
})();
