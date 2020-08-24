"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./common");
const spotify_1 = require("./api/spotify");
const rescue_time_1 = require("./api/rescue-time");
const last_fm_1 = require("./api/last-fm");
const pocket_casts_1 = require("./api/pocket-casts");
const wakatime_1 = require("./api/wakatime");
const cosmic_1 = require("@anandchowdhary/cosmic");
(async () => {
    // if (config("daily").includes("goodreads")) await goodreads();
    if (cosmic_1.config("daily").includes("spotify"))
        await spotify_1.daily();
    if (cosmic_1.config("daily").includes("rescueTime"))
        await rescue_time_1.daily();
    if (cosmic_1.config("daily").includes("pocketCasts"))
        await pocket_casts_1.daily();
    if (cosmic_1.config("daily").includes("wakatime"))
        await wakatime_1.daily();
    if (cosmic_1.config("daily").includes("lastfm"))
        await last_fm_1.daily();
})();
