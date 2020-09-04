"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = exports.daily = void 0;
const pocketcasts_1 = __importDefault(require("pocketcasts"));
const cosmic_1 = require("@anandchowdhary/cosmic");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const common_1 = require("../common");
const dayjs_1 = __importDefault(require("dayjs"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
dayjs_1.default.extend(weekOfYear_1.default);
cosmic_1.cosmicSync("life");
const pocketCasts = new pocketcasts_1.default(cosmic_1.config("pocketCastsUsername"), cosmic_1.config("pocketCastsPassword"));
exports.daily = async () => {
    console.log("Pocket Casts: Starting...");
    await pocketCasts.login();
    const podcasts = (await pocketCasts.getList()).podcasts;
    await common_1.write(path_1.join(".", "data", "pocket-casts-podcasts", "library.json"), JSON.stringify(podcasts, null, 2));
    console.log("Pocket Casts: Added library");
    let items = [];
    try {
        const years = await fs_extra_1.readdir(path_1.join(".", "data", "pocket-casts-podcasts", "daily"));
        const months = await fs_extra_1.readdir(path_1.join(".", "data", "pocket-casts-podcasts", "daily", common_1.zero(Math.max(...years.map(parseInt)).toString())));
        const days = await fs_extra_1.readdir(path_1.join(".", "data", "pocket-casts-podcasts", "daily", common_1.zero(Math.max(...years.map(parseInt)).toString()), common_1.zero(Math.max(...months.map(parseInt)).toString())));
        items = await fs_extra_1.readJson(path_1.join(".", "data", "pocket-casts-podcasts", "daily", common_1.zero(Math.max(...years.map(parseInt)).toString()), common_1.zero(Math.max(...months.map(parseInt)).toString()), common_1.zero(Math.max(...days.map(parseInt)).toString()), "listening-history.json"));
    }
    catch (error) { }
    const history = await pocketCasts.getHistory();
    const newEpisodes = [];
    for (let episode of history.episodes) {
        if (items.find((item) => item.uuid === episode.uuid))
            break;
        newEpisodes.push(episode);
    }
    const date = dayjs_1.default();
    const year = date.format("YYYY");
    const month = date.format("MM");
    const day = date.format("DD");
    await common_1.write(path_1.join(".", "data", "pocket-casts-podcasts", "daily", year, month, day, "listening-history.json"), JSON.stringify(newEpisodes, null, 2));
    console.log(`Pocket Casts: Added ${newEpisodes.length} new episodes`);
    console.log("Pocket Casts: Completed");
};
exports.summary = async () => { };
