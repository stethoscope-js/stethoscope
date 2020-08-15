"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weekly = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const dayjs_1 = __importDefault(require("dayjs"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
const wakatime_client_1 = require("wakatime-client");
dayjs_1.default.extend(weekOfYear_1.default);
cosmic_1.cosmicSync("life");
const client = new wakatime_client_1.WakaTimeClient(cosmic_1.config("wakatimeApiKey"));
exports.daily = async () => {
    console.log("WakaTime: Starting...");
    for await (const date of [
        dayjs_1.default().add(1, "day").format("YYYY-MM-DD"),
        dayjs_1.default().format("YYYY-MM-DD"),
        dayjs_1.default().subtract(1, "day").format("YYYY-MM-DD"),
    ]) {
        const summary = await client.getMySummary({
            dateRange: {
                startDate: date,
                endDate: date,
            },
        });
        if (summary.data.length) {
            const startDate = dayjs_1.default(summary.start).format("YYYY/MM/DD");
            await fs_extra_1.ensureFile(path_1.join(".", "data", "wakatime", "history", `${startDate}.json`));
            await fs_extra_1.writeFile(path_1.join(".", "data", "wakatime", "history", `${startDate}.json`), JSON.stringify(summary.data, null, 2));
        }
    }
    console.log("WakaTime: Added daily summary");
    console.log("WakaTime: Completed");
};
exports.weekly = async () => {
    const myStats = await client.getMyStats({ range: wakatime_client_1.RANGE.LAST_7_DAYS });
    await fs_extra_1.ensureFile(path_1.join(".", "data", "wakatime", "weekly", `${dayjs_1.default().week()}.json`));
    await fs_extra_1.writeFile(path_1.join(".", "data", "wakatime", "weekly", `${dayjs_1.default().week()}.json`), JSON.stringify(myStats.data, null, 2));
    console.log("WakaTime: Added stats");
};
