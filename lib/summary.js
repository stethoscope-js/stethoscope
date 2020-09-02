"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./common");
const cosmic_1 = require("@anandchowdhary/cosmic");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const common_1 = require("./common");
const recursive_readdir_1 = __importDefault(require("recursive-readdir"));
const dayjs_1 = __importDefault(require("dayjs"));
const spotify_1 = require("./api/spotify");
const rescue_time_1 = require("./api/rescue-time");
const last_fm_1 = require("./api/last-fm");
const pocket_casts_1 = require("./api/pocket-casts");
const wakatime_1 = require("./api/wakatime");
const clockify_1 = require("./api/clockify");
const google_fit_1 = require("./api/google-fit");
const oura_ring_1 = require("./api/oura-ring");
const goodreads_1 = require("./api/goodreads");
const apiSummary = async () => {
    const dataTypes = (await fs_extra_1.readdir(path_1.join(".", "data"))).filter((i) => fs_extra_1.lstatSync(path_1.join(".", "data", i)).isDirectory());
    for await (const type of dataTypes) {
        const services = (await fs_extra_1.readdir(path_1.join(".", "data", type))).filter((i) => fs_extra_1.lstatSync(path_1.join(".", "data", type, i)).isDirectory());
        for await (const service of services) {
            const durations = (await fs_extra_1.readdir(path_1.join(".", "data", type, service))).filter((i) => fs_extra_1.lstatSync(path_1.join(".", "data", type, service, i)).isDirectory() &&
                i !== "api");
            for await (const duration of durations) {
                let data = {};
                (await recursive_readdir_1.default(path_1.join(".", "data", type, service, duration)))
                    .sort((a, b) => a.localeCompare(b, undefined, {
                    numeric: true,
                    sensitivity: "base",
                }))
                    .filter((item) => !item.endsWith(".DS_Store"))
                    .forEach((item) => {
                    const fullPath = item.split(path_1.join(".", "data", type, service, duration))[1];
                    const fileName = fullPath.split("/").pop();
                    const directory = fullPath
                        .split(`/${fullPath.split("/").splice(-1, 1).join("/")}`)[0]
                        .substring(1);
                    let title = directory;
                    if (duration === "daily") {
                        title = dayjs_1.default(title).format("MMMM DD, YYYY");
                    }
                    else if (duration === "monthly") {
                        title = dayjs_1.default(`${title.split("/").join("-")}-10`).format("MMMM YYYY");
                    }
                    else if (duration === "weekly") {
                        title = `Week ${title.split("/")[1]}, ${title.split("/")[0]}`;
                    }
                    if (fileName) {
                        data[fileName] = data[fileName] ?? [];
                        data[fileName].push({
                            title,
                            directory,
                        });
                    }
                });
                await common_1.write(path_1.join(".", "data", type, service, "api", `${duration}.json`), JSON.stringify(data, null, 2));
            }
        }
    }
};
(async () => {
    const allConfig = [...(cosmic_1.config("daily") ?? []), ...(cosmic_1.config("weekly") ?? [])];
    if (allConfig.includes("spotify"))
        await spotify_1.summary();
    if (allConfig.includes("rescueTime"))
        await rescue_time_1.summary();
    if (allConfig.includes("pocketCasts"))
        await pocket_casts_1.summary();
    if (allConfig.includes("wakatime"))
        await wakatime_1.summary();
    if (allConfig.includes("lastFm"))
        await last_fm_1.summary();
    if (allConfig.includes("clockify"))
        await clockify_1.summary();
    if (allConfig.includes("googleFit"))
        await google_fit_1.summary();
    if (allConfig.includes("ouraRing"))
        await oura_ring_1.summary();
    if (allConfig.includes("goodreads"))
        await goodreads_1.summary();
    await apiSummary();
})();
