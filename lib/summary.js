"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./common");
const cosmic_1 = require("@anandchowdhary/cosmic");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const recursive_readdir_1 = __importDefault(require("recursive-readdir"));
const dot_object_1 = __importDefault(require("dot-object"));
const common_1 = require("./common");
const dot = new dot_object_1.default("/");
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
        await spotify_1.summary();
    if (cosmic_1.config("daily").includes("rescueTime"))
        await rescuetime_1.summary();
    if (cosmic_1.config("daily").includes("pocketCasts"))
        await pocket_casts_1.summary();
    if (cosmic_1.config("daily").includes("wakatime"))
        await wakatime_1.summary();
    if (cosmic_1.config("daily").includes("lastFm"))
        await last_fm_1.summary();
    if (cosmic_1.config("daily").includes("clockify"))
        await clockify_1.summary();
    if (cosmic_1.config("daily").includes("googleFit"))
        await google_fit_1.summary();
    if (cosmic_1.config("daily").includes("ouraRing"))
        await oura_ring_1.summary();
    if (cosmic_1.config("daily").includes("goodreads"))
        await goodreads_1.summary();
    const categories = await fs_extra_1.readdir(path_1.join(".", "data"));
    for await (const category of categories) {
        if ((await fs_extra_1.pathExists(path_1.join(".", "data", category, "summary"))) &&
            (await fs_extra_1.lstat(path_1.join(".", "data", category, "summary"))).isDirectory()) {
            const files = (await recursive_readdir_1.default(path_1.join(".", "data", category, "summary")))
                .map((path) => path.split(`${path_1.join(".", "data", category, "summary")}/`)[1])
                .sort((a, b) => a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: "base",
            }));
            const data = {};
            files.forEach((file) => {
                const path = file.split("/").map((v) => `_check_${v}`);
                const prefix = path.join("/") === "" ? "root" : path.join("/");
                data[prefix] = true;
            });
            const items = recursivelyClean2(recursivelyClean1(JSON.parse(JSON.stringify(dot.object(data)).replace(/_check_/g, ""))));
            await common_1.write(path_1.join(".", "data", category, "api.json"), JSON.stringify(items, null, 2));
        }
    }
})();
function recursivelyClean1(items) {
    if (typeof items === "object" && !Array.isArray(items)) {
        Object.keys(items).forEach((key) => {
            if (items[key] === true) {
                items[key.replace(".json", "")] = key;
                delete items[key];
            }
            else {
                items[key] = recursivelyClean1(items[key]);
            }
        });
    }
    return items;
}
function recursivelyClean2(items) {
    if (typeof items === "object") {
        Object.keys(items).forEach((key) => {
            if (typeof items[key] === "object") {
                let allStrings = true;
                Object.values(items[key]).forEach((value) => {
                    if (typeof value !== "string")
                        allStrings = false;
                });
                if (!allStrings) {
                    items[key] = recursivelyClean2(items[key]);
                }
                else {
                    items[key] = Object.values(items[key]);
                }
            }
        });
    }
    return items;
}
