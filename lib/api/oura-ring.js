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
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const isoWeeksInYear_1 = __importDefault(require("dayjs/plugin/isoWeeksInYear"));
const isLeapYear_1 = __importDefault(require("dayjs/plugin/isLeapYear"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
dayjs_1.default.extend(weekOfYear_1.default);
dayjs_1.default.extend(isoWeeksInYear_1.default);
dayjs_1.default.extend(isLeapYear_1.default);
cosmic_1.cosmicSync("life");
const canvasRenderService = new chartjs_node_canvas_1.CanvasRenderService(1200, 800);
const updateOuraDailyData = async (date) => {
    const formattedDate = dayjs_1.default(date).format("YYYY-MM-DD");
    const { data: healthData, } = await axios_1.default.get(`https://api.ouraring.com/v1/userinfo?access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    await common_1.write(path_1.join(".", "data", "health", "weight", "daily", dayjs_1.default(formattedDate).format("YYYY"), dayjs_1.default(formattedDate).format("MM"), dayjs_1.default(formattedDate).format("DD"), "sessions.json"), JSON.stringify({ weight: healthData.weight }, null, 2));
    console.log("Oura: Added summary data");
    const { data: sleepData, } = await axios_1.default.get(`https://api.ouraring.com/v1/sleep?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added sleep data");
    await common_1.write(path_1.join(".", "data", "health", "oura-sleep", "daily", dayjs_1.default(formattedDate).format("YYYY"), dayjs_1.default(formattedDate).format("MM"), dayjs_1.default(formattedDate).format("DD"), "sessions.json"), JSON.stringify(sleepData.sleep, null, 2));
    const { data: readinessData, } = await axios_1.default.get(`https://api.ouraring.com/v1/readiness?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added readiness data");
    await common_1.write(path_1.join(".", "data", "health", "readiness", "daily", dayjs_1.default(formattedDate).format("YYYY"), dayjs_1.default(formattedDate).format("MM"), dayjs_1.default(formattedDate).format("DD"), "sessions.json"), JSON.stringify(readinessData.readiness, null, 2));
    const { data: activityData, } = await axios_1.default.get(`https://api.ouraring.com/v1/activity?start=${formattedDate}&end=${formattedDate}&access_token=${cosmic_1.config("ouraPersonalAccessToken")}`);
    console.log("Oura: Added activity data");
    await common_1.write(path_1.join(".", "data", "health", "activity", "daily", dayjs_1.default(formattedDate).format("YYYY"), dayjs_1.default(formattedDate).format("MM"), dayjs_1.default(formattedDate).format("DD"), "sessions.json"), JSON.stringify(activityData.activity, null, 2));
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
    const types = await fs_extra_1.readdir(path_1.join(".", "data", "health"));
    for await (const dataType of types.filter((type) => type !== "weight")) {
        const yearMonths = {};
        const weeks = {};
        const years = await fs_extra_1.readdir(path_1.join(".", "data", "health", dataType, "daily"));
        for await (const year of years) {
            const months = await fs_extra_1.readdir(path_1.join(".", "data", "health", dataType, "daily", year));
            for await (const month of months) {
                const days = await fs_extra_1.readdir(path_1.join(".", "data", "health", dataType, "daily", year, month));
                for await (const day of days) {
                    let data = [];
                    try {
                        data = await fs_extra_1.readJson(path_1.join(".", "data", "health", dataType, "daily", year, month, day, "sessions.json"));
                    }
                    catch (error) { }
                    let sum = 0;
                    let hasSessionDuration = false;
                    data.forEach((session) => {
                        if (session.duration || session.score) {
                            if (session.duration)
                                sum += session.duration;
                            else if (session.score)
                                sum += session.score;
                            hasSessionDuration = true;
                        }
                    });
                    if (hasSessionDuration) {
                        yearMonths[year] = yearMonths[year] ?? {};
                        yearMonths[year][month] = yearMonths[year][month] ?? {};
                        yearMonths[year][month][day] = sum;
                        const weekNumber = dayjs_1.default(`${year}-${month}-${day}`)
                            .week()
                            .toString();
                        weeks[year] = weeks[year] ?? {};
                        weeks[year][weekNumber] = weeks[year][weekNumber] ?? {};
                        weeks[year][weekNumber][day] = sum;
                    }
                }
            }
        }
        // Generate weekly summary
        for await (const year of Object.keys(weeks)) {
            for await (const week of [
                ...Array(dayjs_1.default(`${year}-06-06`).isoWeeksInYear()).keys(),
            ].map((i) => i + 1)) {
                if (dayjs_1.default(`${year}-06-06`).week(week).startOf("week").isBefore(dayjs_1.default())) {
                    const days = {};
                    const dayOne = dayjs_1.default(`${year}-06-06`).week(week).startOf("week");
                    for (let i = 0; i < 7; i++) {
                        const daySubtract = dayOne.subtract(i, "day");
                        if (daySubtract.week() === week)
                            days[daySubtract.format("YYYY-MM-DD")] =
                                (weeks[year][week] ?? {})[daySubtract.format("D")] ?? 0;
                        const dayAdd = dayOne.add(i, "day");
                        if (dayAdd.week() === week)
                            days[dayAdd.format("YYYY-MM-DD")] =
                                (weeks[year][week] ?? {})[dayAdd.format("D")] ?? 0;
                    }
                    await common_1.write(path_1.join(".", "data", "health", dataType, "weekly", year, week.toString(), "sessions.json"), JSON.stringify(days, null, 2));
                    const image = await canvasRenderService.renderToBuffer({
                        type: "bar",
                        data: {
                            labels: Object.keys(days).map((day) => dayjs_1.default(day).format("MMMM DD, YYYY")),
                            datasets: [
                                {
                                    backgroundColor: "#89e0cf",
                                    borderColor: "#1abc9c",
                                    data: Object.values(days).map((val) => Number(val) / 3600),
                                },
                            ],
                        },
                        options: {
                            legend: { display: false },
                        },
                    });
                    await common_1.write(path_1.join(".", "data", "health", dataType, "weekly", year, week.toString(), "graph.png"), image);
                }
            }
        }
        // Generate monthly and yearly summary
        for await (const year of Object.keys(yearMonths)) {
            const yearly = {};
            for await (const month of [...Array(12).keys()].map((i) => i + 1)) {
                if (dayjs_1.default(`${year}-${common_1.zero(month.toString())}-${dayjs_1.default(month).daysInMonth()}`).isBefore(dayjs_1.default())) {
                    let monthlySum = 0;
                    const monthly = {};
                    for (let i = 0; i < dayjs_1.default(month).daysInMonth(); i++) {
                        const day = i + 1;
                        if (dayjs_1.default(`${year}-${common_1.zero(month.toString())}-${day}`).isBefore(dayjs_1.default())) {
                            monthly[day] =
                                ((yearMonths[year] ?? {})[common_1.zero(month.toString())] ?? {})[common_1.zero(day.toString())] ?? 0;
                            monthlySum += monthly[day];
                        }
                    }
                    yearly[month] = monthlySum;
                    await common_1.write(path_1.join(".", "data", "health", dataType, "monthly", year, month.toString(), "sessions.json"), JSON.stringify(monthly, null, 2));
                    const image = await canvasRenderService.renderToBuffer({
                        type: "bar",
                        data: {
                            labels: Object.keys(monthly).map((day) => dayjs_1.default(`${year}-${month}-${day}`).format("MMMM DD, YYYY")),
                            datasets: [
                                {
                                    backgroundColor: "#89e0cf",
                                    borderColor: "#1abc9c",
                                    data: Object.values(monthly).map((val) => Number(val) / 3600),
                                },
                            ],
                        },
                        options: {
                            legend: { display: false },
                        },
                    });
                    await common_1.write(path_1.join(".", "data", "health", dataType, "monthly", year, month.toString(), "graph.png"), image);
                }
            }
            await common_1.write(path_1.join(".", "data", "health", dataType, "yearly", year, "sessions.json"), JSON.stringify(yearly, null, 2));
            const image = await canvasRenderService.renderToBuffer({
                type: "bar",
                data: {
                    labels: Object.keys(yearly).map((month) => dayjs_1.default(`${year}-${month}-06`).format("MMMM YYYY")),
                    datasets: [
                        {
                            backgroundColor: "#89e0cf",
                            borderColor: "#1abc9c",
                            data: Object.values(yearly).map((val) => Number(val) / 3600),
                        },
                    ],
                },
                options: {
                    legend: { display: false },
                },
            });
            await common_1.write(path_1.join(".", "data", "health", dataType, "yearly", year, "graph.png"), image);
        }
        console.log(`Oura Ring: ${dataType} summaries generated`);
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
