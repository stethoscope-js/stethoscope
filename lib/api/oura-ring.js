"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacy = exports.summary = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const axios_1 = __importDefault(require("axios"));
const path_1 = require("path");
const common_1 = require("../common");
const es6_promise_pool_1 = __importDefault(require("es6-promise-pool"));
const dayjs_1 = __importDefault(require("dayjs"));
const fs_extra_1 = require("fs-extra");
const isoWeeksInYear_1 = __importDefault(require("dayjs/plugin/isoWeeksInYear"));
const isLeapYear_1 = __importDefault(require("dayjs/plugin/isLeapYear"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
dayjs_1.default.extend(weekOfYear_1.default);
dayjs_1.default.extend(isoWeeksInYear_1.default);
dayjs_1.default.extend(isLeapYear_1.default);
cosmic_1.cosmicSync("life");
const updateOuraDailyData = async (date) => {
    const formattedDate = dayjs_1.default(date).format("YYYY-MM-DD");
    const { data: healthData, } = await axios_1.default.get(`https://api.ouraring.com/v1/userinfo?access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    await common_1.write(path_1.join(".", "data", "oura-weight", "daily", dayjs_1.default(formattedDate).format("YYYY"), dayjs_1.default(formattedDate).format("MM"), dayjs_1.default(formattedDate).format("DD"), "sessions.json"), JSON.stringify({ weight: healthData.weight }, null, 2));
    console.log("Oura: Added summary data");
    const { data: sleepData, } = await axios_1.default.get(`https://api.ouraring.com/v1/sleep?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added sleep data");
    await common_1.write(path_1.join(".", "data", "oura-sleep", "daily", dayjs_1.default(formattedDate).format("YYYY"), dayjs_1.default(formattedDate).format("MM"), dayjs_1.default(formattedDate).format("DD"), "sessions.json"), JSON.stringify(sleepData.sleep, null, 2));
    const { data: readinessData, } = await axios_1.default.get(`https://api.ouraring.com/v1/readiness?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added readiness data");
    await common_1.write(path_1.join(".", "data", "oura-readiness", "daily", dayjs_1.default(formattedDate).format("YYYY"), dayjs_1.default(formattedDate).format("MM"), dayjs_1.default(formattedDate).format("DD"), "sessions.json"), JSON.stringify(readinessData.readiness, null, 2));
    const { data: activityData, } = await axios_1.default.get(`https://api.ouraring.com/v1/activity?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added activity data");
    await common_1.write(path_1.join(".", "data", "oura-activity", "daily", dayjs_1.default(formattedDate).format("YYYY"), dayjs_1.default(formattedDate).format("MM"), dayjs_1.default(formattedDate).format("DD"), "sessions.json"), JSON.stringify(activityData.activity, null, 2));
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
exports.summary = async () => {
    for await (const key of [
        "steps",
        "total",
        "cal_active",
        "cal_total",
        "rem",
        "awake",
        "deep",
        "duration",
        "efficiency",
        "light",
    ]) {
        for await (const category of [
            "oura-readiness",
            "oura-activity",
            "oura-weight",
            "oura-sleep",
        ]) {
            // Find all items that have daily
            if ((await fs_extra_1.pathExists(path_1.join(".", "data", category, "daily"))) &&
                (await fs_extra_1.lstat(path_1.join(".", "data", category, "daily"))).isDirectory()) {
                const years = (await fs_extra_1.readdir(path_1.join(".", "data", category, "daily"))).filter((i) => /^\d+$/.test(i));
                const yearData = {};
                for await (const year of years) {
                    let yearlySum = 0;
                    const monthlyData = {};
                    [...Array(13).keys()]
                        .slice(1)
                        .forEach((val) => (monthlyData[val.toString()] = 0));
                    const months = (await fs_extra_1.readdir(path_1.join(".", "data", category, "daily", year))).filter((i) => /^\d+$/.test(i));
                    for await (const month of months) {
                        let monthlySum = 0;
                        const dailyData = {};
                        [...Array(dayjs_1.default(`${year}-${month}-10`).daysInMonth()).keys()]
                            .slice(1)
                            .forEach((val) => (dailyData[val.toString()] = 0));
                        const days = (await fs_extra_1.readdir(path_1.join(".", "data", category, "daily", year, month))).filter((i) => /^\d+$/.test(i));
                        for await (const day of days) {
                            let json = await fs_extra_1.readJson(path_1.join(".", "data", category, "daily", year, month, day, "sessions.json"));
                            let dailySum = 0;
                            if (Array.isArray(json)) {
                                json.forEach((record) => {
                                    if (key in record) {
                                        dailySum += record[key];
                                    }
                                });
                            }
                            if (dailySum)
                                dailyData[parseInt(day)] = dailySum;
                            monthlySum += dailySum;
                            yearlySum += dailySum;
                        }
                        if (Object.keys(dailyData).length &&
                            Object.values(dailyData).reduce((a, b) => a + b, 0))
                            await common_1.write(path_1.join(".", "data", category, "summary", key.replace(/_/g, "-"), "days", year, `${month}.json`), JSON.stringify(dailyData, null, 2));
                        if (monthlySum)
                            monthlyData[parseInt(month)] = monthlySum;
                    }
                    if (Object.keys(monthlyData).length &&
                        Object.values(monthlyData).reduce((a, b) => a + b, 0))
                        await common_1.write(path_1.join(".", "data", category, "summary", key.replace(/_/g, "-"), "months", `${year}.json`), JSON.stringify(monthlyData, null, 2));
                    if (yearlySum)
                        yearData[parseInt(year)] = yearlySum;
                }
                if (Object.keys(yearData).length &&
                    Object.values(yearData).reduce((a, b) => a + b, 0))
                    await common_1.write(path_1.join(".", "data", category, "summary", key.replace(/_/g, "-"), "years.json"), JSON.stringify(yearData, null, 2));
            }
        }
    }
};
exports.legacy = async () => {
    const CONCURRENCY = 1;
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
