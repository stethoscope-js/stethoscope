"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const axios_1 = __importDefault(require("axios"));
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const dayjs_1 = __importDefault(require("dayjs"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
const common_1 = require("../common");
dayjs_1.default.extend(weekOfYear_1.default);
cosmic_1.cosmicSync("life");
exports.daily = async () => {
    console.log("Rescue Time: Starting...");
    const dailySummary = (await axios_1.default.get(`https://www.rescuetime.com/anapi/daily_summary_feed?key=${cosmic_1.config("rescuetimeApiKey")}`)).data;
    for await (const item of dailySummary) {
        const date = new Date(item.date);
        const year = common_1.zero(date.getUTCFullYear().toString());
        const month = common_1.zero((date.getUTCMonth() + 1).toString());
        const day = common_1.zero(date.getUTCDate().toString());
        await fs_extra_1.ensureDir(path_1.join(".", "data", "rescue-time", "daily", year, month));
        await fs_extra_1.writeFile(path_1.join(".", "data", "rescue-time", "daily", year, month, `${day}.json`), JSON.stringify(item, null, 2));
    }
    console.log("Rescue Time: Added daily summaries");
    const weeklySummary = (await axios_1.default.get(`https://www.rescuetime.com/anapi/data?format=json&key=${cosmic_1.config("rescuetimeApiKey")}&restrict_begin=${new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .slice(0, 10)}&restrict_end=${new Date().toISOString().slice(0, 10)}`)).data;
    const headers = weeklySummary.row_headers;
    const items = weeklySummary.rows;
    const data = [];
    await fs_extra_1.ensureDir(path_1.join(".", "data", "rescue-time", "weekly"));
    items.forEach((item, index) => {
        if (index < 100) {
            const details = {};
            headers.forEach((header, index) => {
                details[header] = item[index];
            });
            data.push(details);
        }
    });
    await fs_extra_1.writeFile(path_1.join(".", "data", "rescue-time", "weekly", `${dayjs_1.default().week()}.json`), JSON.stringify(data, null, 2));
    console.log("Rescue Time: Added weekly summaries");
    console.log("Rescue Time: Completed");
};
