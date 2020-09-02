"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacy = exports.summary = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const googleapis_1 = require("googleapis");
const common_1 = require("../common");
const path_1 = require("path");
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const dayjs_1 = __importDefault(require("dayjs"));
const es6_promise_pool_1 = __importDefault(require("es6-promise-pool"));
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
const oauth2Client = new googleapis_1.google.auth.OAuth2(cosmic_1.config("googleFitClientId"), cosmic_1.config("googleFitClientSecret"), "https://developers.google.com/oauthplayground");
oauth2Client.setCredentials({
    access_token: cosmic_1.config("googleFitAccessToken"),
    refresh_token: cosmic_1.config("googleFitRefreshToken"),
});
const fitness = googleapis_1.google.fitness({ version: "v1", auth: oauth2Client });
const saveData = async (data) => {
    const itemsByDateAndType = {};
    data.forEach((session) => {
        if (session.startTimeMillis && session.name) {
            const name = slugify_1.default(session.name);
            const date = dayjs_1.default(new Date(parseInt(session.startTimeMillis)));
            const year = date.format("YYYY");
            const month = date.format("MM");
            const day = date.format("DD");
            itemsByDateAndType[name] = itemsByDateAndType[name] ?? {};
            itemsByDateAndType[name][`${year}/${month}/${day}`] =
                itemsByDateAndType[name][`${year}/${month}/${day}`] ?? [];
            itemsByDateAndType[name][`${year}/${month}/${day}`].push({
                ...session,
                startTime: new Date(parseInt(session.startTimeMillis)),
                endTime: session.endTimeMillis
                    ? new Date(parseInt(session.endTimeMillis))
                    : undefined,
            });
        }
    });
    for await (const sessionType of Object.keys(itemsByDateAndType)) {
        for await (const sessionDate of Object.keys(itemsByDateAndType[sessionType])) {
            await common_1.write(path_1.join(".", "data", "health", sessionType, "daily", sessionDate, "sessions.json"), JSON.stringify(itemsByDateAndType[sessionType][sessionDate], null, 2));
        }
    }
};
const updateGoogleFitDailyData = async (date) => {
    const sources = await fitness.users.sessions.list({
        userId: "me",
        startTime: dayjs_1.default(date).startOf("day").toISOString(),
        endTime: dayjs_1.default(date).endOf("day").toISOString(),
    });
    if (sources.data.session?.length)
        await saveData(sources.data.session);
    console.log(`Fetched ${sources.data.session?.length ?? 0} workout sessions for ${date.toLocaleDateString()}`);
    if (sources.data.session)
        await saveData(sources.data.session);
};
exports.daily = async () => {
    console.log("Google Fit: Starting...");
    await updateGoogleFitDailyData(dayjs_1.default().subtract(1, "day").toDate());
    console.log("Google Fit: Added yesterday's data");
    await updateGoogleFitDailyData(dayjs_1.default().toDate());
    console.log("Google Fit: Added today's data");
    await updateGoogleFitDailyData(dayjs_1.default().add(1, "day").toDate());
    console.log("Google Fit: Added tomorrow's data");
    console.log("Google Fit: Added daily summaries");
};
exports.summary = async () => {
    const types = await fs_extra_1.readdir(path_1.join(".", "data", "health"));
    for await (const dataType of types) {
        const yearMonths = {};
        const weeks = {};
        const years = await fs_extra_1.readdir(path_1.join(".", "data", "health", dataType, "daily"));
        for await (const year of years) {
            const months = await fs_extra_1.readdir(path_1.join(".", "data", "health", dataType, "daily", year));
            for await (const month of months) {
                const days = await fs_extra_1.readdir(path_1.join(".", "data", "health", dataType, "daily", year, month));
                for await (const day of days) {
                    const _data = await fs_extra_1.readJson(path_1.join(".", "data", "health", dataType, "daily", year, month, day, "sessions.json"));
                    /**
                     * Combine overlapping ranges
                     * @source https://stackoverflow.com/a/42002001/1656944
                     */
                    const data = _data
                        .sort((a, b) => dayjs_1.default(a.startTime).unix() - dayjs_1.default(b.startTime).unix() ||
                        dayjs_1.default(a.endTime).unix() - dayjs_1.default(b.endTime).unix())
                        .reduce((r, a) => {
                        const last = r[r.length - 1] || [];
                        if (dayjs_1.default(last.startTime).unix() <= dayjs_1.default(a.startTime).unix() &&
                            dayjs_1.default(a.startTime).unix() <= dayjs_1.default(last.endTime).unix()) {
                            if (dayjs_1.default(last.endTime).unix() < dayjs_1.default(a.endTime).unix()) {
                                last.endTime = a.endTime;
                            }
                            return r;
                        }
                        return r.concat(a);
                    }, []);
                    let sum = 0;
                    data.forEach((session) => {
                        const seconds = dayjs_1.default(session.endTime).diff(dayjs_1.default(session.startTime), "second");
                        sum += seconds;
                    });
                    yearMonths[year] = yearMonths[year] ?? {};
                    yearMonths[year][month] = yearMonths[year][month] ?? {};
                    yearMonths[year][month][day] = sum;
                    const weekNumber = dayjs_1.default(`${year}-${month}-${day}`).week().toString();
                    weeks[year] = weeks[year] ?? {};
                    weeks[year][weekNumber] = weeks[year][weekNumber] ?? {};
                    weeks[year][weekNumber][day] = sum;
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
                    await common_1.write(path_1.join(".", "data", "health", dataType, "weekly", year, week.toString(), "summary.json"), JSON.stringify(days, null, 2));
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
                    await common_1.write(path_1.join(".", "data", "health", dataType, "monthly", year, month.toString(), "summary.json"), JSON.stringify(monthly, null, 2));
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
            await common_1.write(path_1.join(".", "data", "health", dataType, "yearly", year, "summary.json"), JSON.stringify(yearly, null, 2));
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
        console.log(`Google Fit: ${dataType} summaries generated`);
    }
};
exports.legacy = async () => {
    const CONCURRENCY = 1;
    const startDate = dayjs_1.default("2020-07-29");
    let count = 0;
    const pool = new es6_promise_pool_1.default(async () => {
        const date = dayjs_1.default(startDate).add(count, "day");
        if (dayjs_1.default().diff(date, "day") === 0)
            return null;
        count++;
        return updateGoogleFitDailyData(date.toDate());
    }, CONCURRENCY);
    await pool.start();
    console.log("Done!");
};
