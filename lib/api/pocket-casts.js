"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.daily = void 0;
const pocketcasts_1 = __importDefault(require("pocketcasts"));
const cosmic_1 = require("@anandchowdhary/cosmic");
const path_1 = require("path");
const common_1 = require("../common");
const fs_extra_1 = require("fs-extra");
cosmic_1.cosmicSync("life");
const pocketCasts = new pocketcasts_1.default(cosmic_1.config("pocketCastsUsername"), cosmic_1.config("pocketCastsPassword"));
exports.daily = async () => {
    console.log("Pocket Casts: Starting...");
    await pocketCasts.login();
    const podcasts = (await pocketCasts.getList()).podcasts;
    await fs_extra_1.ensureDir(path_1.join(".", "data", "podcasts"));
    await fs_extra_1.writeFile(path_1.join(".", "data", "podcasts", "library.json"), JSON.stringify(podcasts, null, 2));
    console.log("Pocket Casts: Added library");
    await fs_extra_1.ensureDir(path_1.join(".", "data", "podcasts", "history"));
    let items = [];
    try {
        const years = await fs_extra_1.readdir(path_1.join(".", "data", "podcasts", "history"));
        const months = await fs_extra_1.readdir(path_1.join(".", "data", "podcasts", "history", common_1.zero(Math.max(...years.map(parseInt)).toString())));
        const days = await fs_extra_1.readdir(path_1.join(".", "data", "podcasts", "history", common_1.zero(Math.max(...years.map(parseInt)).toString()), common_1.zero(Math.max(...months.map(parseInt)).toString())));
        items = await fs_extra_1.readJson(path_1.join(".", "data", "podcasts", "history", common_1.zero(Math.max(...years.map(parseInt)).toString()), common_1.zero(Math.max(...months.map(parseInt)).toString()), `${common_1.zero(Math.max(...days.map(parseInt)).toString())}.json`));
    }
    catch (error) { }
    const history = await pocketCasts.getHistory();
    const newEpisodes = [];
    for (let episode of history.episodes) {
        if (items.find((item) => item.uuid === episode.uuid))
            break;
        newEpisodes.push(episode);
    }
    const date = new Date();
    const year = common_1.zero(date.getUTCFullYear().toString());
    const month = common_1.zero((date.getUTCMonth() + 1).toString());
    const day = common_1.zero(date.getUTCDate().toString());
    await fs_extra_1.ensureDir(path_1.join(".", "data", "podcasts", "history", year, month));
    await fs_extra_1.writeFile(path_1.join(".", "data", "podcasts", "history", year, month, `${day}.json`), JSON.stringify(newEpisodes, null, 2));
    console.log(`Pocket Casts: Added ${newEpisodes.length} new episodes`);
    console.log("Pocket Casts: Completed");
};
