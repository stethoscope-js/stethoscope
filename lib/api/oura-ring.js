"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacy = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const axios_1 = __importDefault(require("axios"));
const path_1 = require("path");
const common_1 = require("../common");
const es6_promise_pool_1 = __importDefault(require("es6-promise-pool"));
const dayjs_1 = __importDefault(require("dayjs"));
cosmic_1.cosmicSync("life");
const updateOuraDailyData = async (date) => {
    const formattedDate = dayjs_1.default(date).format("YYYY-MM-DD");
    const { data: healthData, } = await axios_1.default.get(`https://api.ouraring.com/v1/userinfo?access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    await common_1.write(path_1.join(".", "data", "health", "oura-ring", "daily", "weight", dayjs_1.default().format("YYYY"), dayjs_1.default().format("MM"), dayjs_1.default().format("DD"), "data.json"), JSON.stringify({ weight: healthData.weight }, null, 2));
    console.log("Oura: Added summary data");
    const { data: sleepData, } = await axios_1.default.get(`https://api.ouraring.com/v1/sleep?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added sleep data");
    await common_1.write(path_1.join(".", "data", "health", "oura-ring", "daily", "sleep", dayjs_1.default().format("YYYY"), dayjs_1.default().format("MM"), dayjs_1.default().format("DD"), "summary.json"), JSON.stringify(sleepData, null, 2));
    const { data: readinessData, } = await axios_1.default.get(`https://api.ouraring.com/v1/readiness?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added readiness data");
    await common_1.write(path_1.join(".", "data", "health", "oura-ring", "daily", "readiness", dayjs_1.default().format("YYYY"), dayjs_1.default().format("MM"), dayjs_1.default().format("DD"), "summary.json"), JSON.stringify(readinessData, null, 2));
    const { data: activityData, } = await axios_1.default.get(`https://api.ouraring.com/v1/activity?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added activity data");
    await common_1.write(path_1.join(".", "data", "health", "oura-ring", "daily", "activity", dayjs_1.default().format("YYYY"), dayjs_1.default().format("MM"), dayjs_1.default().format("DD"), "summary.json"), JSON.stringify(activityData, null, 2));
};
exports.daily = async () => {
    console.log("Oura: Starting...");
    await updateOuraDailyData(dayjs_1.default().subtract(1, "day").toDate());
    console.log("Oura: Added yesterday's data");
    await updateOuraDailyData(dayjs_1.default().toDate());
    console.log("Oura: Added today's data");
    await updateOuraDailyData(dayjs_1.default().add(1, "day").toDate());
    console.log("Oura: Added tomorrow's data");
    console.log("Oura: Added daily summaries");
};
exports.daily();
exports.legacy = async () => {
    const CONCURRENCY = 10;
    const startDate = dayjs_1.default("2020-08-15");
    let count = 0;
    const pool = new es6_promise_pool_1.default(async () => {
        const date = dayjs_1.default(startDate).add(count, "day");
        if (dayjs_1.default().diff(date, "day") === 0)
            return null;
        count++;
        return updateOuraDailyData(date.toDate());
    }, CONCURRENCY);
    await pool.start();
    console.log("Done!");
};
