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
cosmic_1.cosmicSync("life");
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
            await common_1.write(path_1.join(".", "data", "health", "google-fit", "daily", sessionType, sessionDate, "sessions.json"), JSON.stringify(itemsByDateAndType[sessionType][sessionDate], null, 2));
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
    const types = await fs_extra_1.readdir(path_1.join(".", "data", "health", "google-fit", "daily"));
    for await (const dataType of types) {
        const yearMonths = {};
        const years = await fs_extra_1.readdir(path_1.join(".", "data", "health", "google-fit", "daily", dataType));
        for await (const year of years) {
            const months = await fs_extra_1.readdir(path_1.join(".", "data", "health", "google-fit", "daily", dataType, year));
            for await (const month of months) {
                const days = await fs_extra_1.readdir(path_1.join(".", "data", "health", "google-fit", "daily", dataType, year, month));
                for await (const day of days) {
                    const data = await fs_extra_1.readJson(path_1.join(".", "data", "health", "google-fit", "daily", dataType, year, month, day, "sessions.json"));
                    let sum = 0;
                    data.forEach((session) => {
                        const seconds = dayjs_1.default(session.endTime).diff(dayjs_1.default(session.startTime), "second");
                        sum += seconds;
                    });
                    yearMonths[`${year}/${month}`] = sum;
                }
            }
        }
        for await (const yearMonth of Object.keys(yearMonths)) {
            await common_1.write(path_1.join(".", "data", "health", "google-fit", "monthly", dataType, yearMonth, "summary.json"), JSON.stringify({ seconds: yearMonths[yearMonth] }, null, 2));
        }
        console.log(`Google Fit: Monthly ${dataType} summary generated`);
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
