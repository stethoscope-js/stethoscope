"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = exports.legacy = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const axios_1 = __importDefault(require("axios"));
const path_1 = require("path");
const common_1 = require("../common");
const es6_promise_pool_1 = __importDefault(require("es6-promise-pool"));
const dayjs_1 = __importDefault(require("dayjs"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
const fs_extra_1 = require("fs-extra");
dayjs_1.default.extend(weekOfYear_1.default);
cosmic_1.cosmicSync("life");
const updateRescueTimeDailyData = async (date) => {
    const formattedDate = dayjs_1.default(date).format("YYYY-MM-DD");
    console.log("Rescue Time: Adding data for", date);
    const topCategories = (await axios_1.default.get(`https://www.rescuetime.com/anapi/data?format=json&key=${cosmic_1.config("rescuetimeApiKey")}&restrict_kind=category&restrict_begin=${formattedDate}&restrict_end=${formattedDate}`)).data;
    const topCategoriesHeaders = topCategories.row_headers;
    const topCategoriesItems = topCategories.rows;
    const topCategoriesData = [];
    topCategoriesItems.forEach((item) => {
        const details = {};
        topCategoriesHeaders.forEach((header, index) => {
            details[header] = item[index];
        });
        topCategoriesData.push(details);
    });
    const topActivities = (await axios_1.default.get(`https://www.rescuetime.com/anapi/data?format=json&key=${cosmic_1.config("rescuetimeApiKey")}&restrict_kind=activity&restrict_begin=${formattedDate}&restrict_end=${formattedDate}`)).data;
    const topActivitiesHeaders = topActivities.row_headers;
    const topActivitiesItems = topActivities.rows;
    const topActivitiesData = [];
    topActivitiesItems.forEach((item) => {
        const details = {};
        topActivitiesHeaders.forEach((header, index) => {
            details[header] = item[index];
        });
        topActivitiesData.push(details);
    });
    const topOverview = (await axios_1.default.get(`https://www.rescuetime.com/anapi/data?format=json&key=${cosmic_1.config("rescuetimeApiKey")}&restrict_kind=overview&restrict_begin=${formattedDate}&restrict_end=${formattedDate}`)).data;
    const topOverviewHeaders = topOverview.row_headers;
    const topOverviewItems = topOverview.rows;
    const topOverviewData = [];
    topOverviewItems.forEach((item) => {
        const details = {};
        topOverviewHeaders.forEach((header, index) => {
            details[header] = item[index];
        });
        topOverviewData.push(details);
    });
    const year = dayjs_1.default(date).format("YYYY");
    const month = dayjs_1.default(date).format("MM");
    const day = dayjs_1.default(date).format("DD");
    await common_1.write(path_1.join(".", "data", "rescuetime-time-tracking", "daily", year, month, day, "top-categories.json"), JSON.stringify(topCategoriesData, null, 2));
    await common_1.write(path_1.join(".", "data", "rescuetime-time-tracking", "daily", year, month, day, "top-overview.json"), JSON.stringify(topOverviewData, null, 2));
    if (cosmic_1.config("config")?.rescueTime?.trackTopActivities)
        await common_1.write(path_1.join(".", "data", "rescuetime-time-tracking", "daily", year, month, day, "top-activities.json"), JSON.stringify(topActivitiesData, null, 2));
};
exports.daily = async () => {
    console.log("Rescue Time: Starting...");
    await updateRescueTimeDailyData(dayjs_1.default().subtract(1, "day").toDate());
    console.log("Rescue Time: Added yesterday's data");
    await updateRescueTimeDailyData(dayjs_1.default().toDate());
    console.log("Rescue Time: Added today's data");
    await updateRescueTimeDailyData(dayjs_1.default().add(1, "day").toDate());
    console.log("Rescue Time: Added tomorrow's data");
    console.log("Rescue Time: Added daily summaries");
};
exports.legacy = async () => {
    const CONCURRENCY = 10;
    const startDate = dayjs_1.default("2017-12-18");
    let count = 0;
    const pool = new es6_promise_pool_1.default(async () => {
        const date = dayjs_1.default(startDate).add(count, "day");
        if (dayjs_1.default().diff(date, "day") === 0)
            return null;
        count++;
        return updateRescueTimeDailyData(date.toDate());
    }, CONCURRENCY);
    await pool.start();
    console.log("Done!");
};
exports.summary = async () => {
    if ((await fs_extra_1.pathExists(path_1.join(".", "data", "rescuetime-time-tracking", "daily"))) &&
        (await fs_extra_1.lstat(path_1.join(".", "data", "rescuetime-time-tracking", "daily"))).isDirectory()) {
        for await (const file of ["top-categories.json", "top-overview.json"]) {
            const years = (await fs_extra_1.readdir(path_1.join(".", "data", "rescuetime-time-tracking", "daily"))).filter((i) => /^\d+$/.test(i));
            const yearData = {};
            for await (const year of years) {
                let yearlySum = {};
                const monthlyData = {};
                [...Array(13).keys()]
                    .slice(1)
                    .forEach((val) => (monthlyData[val.toString()] = {}));
                const months = (await fs_extra_1.readdir(path_1.join(".", "data", "rescuetime-time-tracking", "daily", year))).filter((i) => /^\d+$/.test(i));
                for await (const month of months) {
                    let monthlySum = {};
                    const dailyData = {};
                    [...Array(dayjs_1.default(`${year}-${month}-10`).daysInMonth()).keys()]
                        .slice(1)
                        .forEach((val) => (dailyData[val.toString()] = {}));
                    const days = (await fs_extra_1.readdir(path_1.join(".", "data", "rescuetime-time-tracking", "daily", year, month))).filter((i) => /^\d+$/.test(i));
                    for await (const day of days) {
                        let json = [];
                        try {
                            json = await fs_extra_1.readJson(path_1.join(".", "data", "rescuetime-time-tracking", "daily", year, month, day, file));
                        }
                        catch (error) { }
                        let dailySum = {};
                        if (Array.isArray(json) && json.length) {
                            json.forEach((record) => {
                                if (record["Time Spent (seconds)"] && record.Category) {
                                    dailySum[record.Category] = dailySum[record.Category] ?? 0;
                                    dailySum[record.Category] += record["Time Spent (seconds)"];
                                }
                            });
                        }
                        if (Object.keys(dailySum).length)
                            dailyData[parseInt(day)] = dailySum;
                        Object.keys(dailySum).forEach((key) => {
                            monthlySum[key] = monthlySum[key] ?? 0;
                            monthlySum[key] += dailySum[key];
                            yearlySum[key] = yearlySum[key] ?? 0;
                            yearlySum[key] += dailySum[key];
                        });
                    }
                    if (Object.keys(dailyData).length)
                        await common_1.write(path_1.join(".", "data", "rescuetime-time-tracking", "summary", file.replace(".json", ""), "days", year, `${month}.json`), JSON.stringify(dailyData, null, 2));
                    if (monthlySum)
                        monthlyData[parseInt(month)] = monthlySum;
                }
                if (Object.keys(monthlyData).length)
                    await common_1.write(path_1.join(".", "data", "rescuetime-time-tracking", "summary", file.replace(".json", ""), "months", `${year}.json`), JSON.stringify(monthlyData, null, 2));
                if (yearlySum)
                    yearData[parseInt(year)] = yearlySum;
            }
            if (Object.keys(yearData).length)
                await common_1.write(path_1.join(".", "data", "rescuetime-time-tracking", "summary", file.replace(".json", ""), "years.json"), JSON.stringify(yearData, null, 2));
        }
    }
};
