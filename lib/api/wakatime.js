"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = exports.legacy = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const path_1 = require("path");
const common_1 = require("../common");
const es6_promise_pool_1 = __importDefault(require("es6-promise-pool"));
const dayjs_1 = __importDefault(require("dayjs"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
const wakatime_client_1 = require("wakatime-client");
dayjs_1.default.extend(weekOfYear_1.default);
cosmic_1.cosmicSync("life");
const client = new wakatime_client_1.WakaTimeClient(cosmic_1.config("wakatimeApiKey"));
const updateWakatimeDailyData = async (date) => {
    const formattedDate = dayjs_1.default(date).format("YYYY-MM-DD");
    console.log("WakaTime: Adding data for", formattedDate);
    const summary = await client.getMySummary({
        dateRange: {
            startDate: formattedDate,
            endDate: formattedDate,
        },
    });
    if (summary.data.length) {
        const startDate = dayjs_1.default(summary.start).format("YYYY/MM/DD");
        await common_1.write(path_1.join(".", "data", "time-tracking", "wakatime", "daily", startDate, "daily-summary.json"), JSON.stringify(summary.data, null, 2));
    }
};
exports.daily = async () => {
    console.log("WakaTime: Starting...");
    await updateWakatimeDailyData(dayjs_1.default().subtract(1, "day").toDate());
    console.log("WakaTime: Added yesterday's data");
    await updateWakatimeDailyData(dayjs_1.default().toDate());
    console.log("WakaTime: Added today's data");
    await updateWakatimeDailyData(dayjs_1.default().add(1, "day").toDate());
    console.log("WakaTime: Added tomorrow's data");
    console.log("WakaTime: Added daily summaries");
};
exports.legacy = async () => {
    const CONCURRENCY = 3;
    const startDate = dayjs_1.default("2020-07-20");
    let count = 0;
    const pool = new es6_promise_pool_1.default(async () => {
        const date = dayjs_1.default(startDate).add(count, "day");
        if (dayjs_1.default().diff(date, "day") === 0)
            return null;
        count++;
        return updateWakatimeDailyData(date.toDate());
    }, CONCURRENCY);
    await pool.start();
    console.log("Done!");
};
exports.summary = async () => { };
