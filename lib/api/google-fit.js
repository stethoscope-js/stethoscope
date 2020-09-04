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
const isoWeeksInYear_1 = __importDefault(require("dayjs/plugin/isoWeeksInYear"));
const isLeapYear_1 = __importDefault(require("dayjs/plugin/isLeapYear"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
dayjs_1.default.extend(weekOfYear_1.default);
dayjs_1.default.extend(isoWeeksInYear_1.default);
dayjs_1.default.extend(isLeapYear_1.default);
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
            await common_1.write(path_1.join(".", "data", `google-fit-${sessionType.replace(/_/g, "-")}`, "daily", sessionDate, "sessions.json"), JSON.stringify(itemsByDateAndType[sessionType][sessionDate], null, 2));
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
    for await (const category of [
        "aerobics",
        "archery",
        "badminton",
        "baseball",
        "basketball",
        "biathlon",
        "biking",
        "biking-hand",
        "biking-mountain",
        "biking-road",
        "biking-spinning",
        "biking-stationary",
        "biking-utility",
        "boxing",
        "calisthenics",
        "circuit-training",
        "cricket",
        "crossfit",
        "curling",
        "dancing",
        "diving",
        "elevator",
        "elliptical",
        "ergometer",
        "escalator",
        "extra-status",
        "fencing",
        "football-american",
        "football-australian",
        "football-soccer",
        "frisbee-disc",
        "gardening",
        "golf",
        "guided-breathing",
        "gymnastics",
        "handball",
        "high-intensity-interval-training",
        "hiking",
        "hockey",
        "horseback-riding",
        "housework",
        "ice-skating",
        "interval-training",
        "in-vehicle",
        "jump-rope",
        "kayaking",
        "kettlebell-training",
        "kickboxing",
        "kick-scooter",
        "kitesurfing",
        "martial-arts",
        "meditation",
        "mime-type-prefix",
        "mixed-martial-arts",
        "on-foot",
        "other",
        "p90x",
        "paragliding",
        "pilates",
        "polo",
        "racquetball",
        "rock-climbing",
        "rowing",
        "rowing-machine",
        "rugby",
        "running",
        "running-jogging",
        "running-sand",
        "running-treadmill",
        "sailing",
        "scuba-diving",
        "skateboarding",
        "skating",
        "skating-cross",
        "skating-indoor",
        "skating-inline",
        "skiing",
        "skiing-back-country",
        "skiing-cross-country",
        "skiing-downhill",
        "skiing-kite",
        "skiing-roller",
        "sledding",
        "sleep",
        "sleep-awake",
        "sleep-deep",
        "sleep-light",
        "sleep-rem",
        "snowboarding",
        "snowmobile",
        "snowshoeing",
        "softball",
        "squash",
        "stair-climbing",
        "stair-climbing-machine",
        "standup-paddleboarding",
        "status-active",
        "status-completed",
        "still",
        "strength-training",
        "surfing",
        "swimming",
        "swimming-open-water",
        "swimming-pool",
        "table-tennis",
        "team-sports",
        "tennis",
        "tilting",
        "treadmill",
        "unknown",
        "volleyball",
        "volleyball-beach",
        "volleyball-indoor",
        "wakeboarding",
        "walking",
        "walking-fitness",
        "walking-nordic",
        "walking-stroller",
        "walking-treadmill",
        "water-polo",
        "weightlifting",
        "wheelchair",
        "windsurfing",
        "yoga",
        "zumba",
    ]) {
        // Find all items that have daily
        if ((await fs_extra_1.pathExists(path_1.join(".", "data", `google-fit-${category}`, "daily"))) &&
            (await fs_extra_1.lstat(path_1.join(".", "data", `google-fit-${category}`, "daily"))).isDirectory()) {
            const years = (await fs_extra_1.readdir(path_1.join(".", "data", `google-fit-${category}`, "daily"))).filter((i) => /^\d+$/.test(i));
            const yearData = {};
            for await (const year of years) {
                let yearlySum = 0;
                const monthlyData = {};
                [...Array(13).keys()]
                    .slice(1)
                    .forEach((val) => (monthlyData[val.toString()] = 0));
                const months = (await fs_extra_1.readdir(path_1.join(".", "data", `google-fit-${category}`, "daily", year))).filter((i) => /^\d+$/.test(i));
                for await (const month of months) {
                    let monthlySum = 0;
                    const dailyData = {};
                    [...Array(dayjs_1.default(`${year}-${month}-10`).daysInMonth()).keys()]
                        .slice(1)
                        .forEach((val) => (dailyData[val.toString()] = 0));
                    const days = (await fs_extra_1.readdir(path_1.join(".", "data", `google-fit-${category}`, "daily", year, month))).filter((i) => /^\d+$/.test(i));
                    for await (const day of days) {
                        let json = await fs_extra_1.readJson(path_1.join(".", "data", `google-fit-${category}`, "daily", year, month, day, "sessions.json"));
                        let dailySum = 0;
                        if (Array.isArray(json)) {
                            // If it's a Google Fit health record
                            try {
                                json = json
                                    .sort((a, b) => dayjs_1.default(a.startTime).unix() - dayjs_1.default(b.startTime).unix() ||
                                    dayjs_1.default(a.endTime).unix() - dayjs_1.default(b.endTime).unix())
                                    .reduce((r, a) => {
                                    const last = r[r.length - 1] || [];
                                    if (dayjs_1.default(last.startTime).unix() <=
                                        dayjs_1.default(a.startTime).unix() &&
                                        dayjs_1.default(a.startTime).unix() <= dayjs_1.default(last.endTime).unix()) {
                                        if (dayjs_1.default(last.endTime).unix() < dayjs_1.default(a.endTime).unix()) {
                                            last.endTime = a.endTime;
                                        }
                                        return r;
                                    }
                                    return r.concat(a);
                                }, []);
                            }
                            catch (error) { }
                            json.forEach((record) => {
                                if (record.startTime && record.endTime) {
                                    dailySum += dayjs_1.default(record.endTime).diff(record.startTime, "second");
                                }
                                else if (record.total) {
                                    dailySum += record.total;
                                }
                            });
                        }
                        if (dailySum)
                            dailyData[parseInt(day)] = dailySum;
                        monthlySum += dailySum;
                        yearlySum += dailySum;
                    }
                    if (Object.keys(dailyData).length)
                        await common_1.write(path_1.join(".", "data", `google-fit-${category}`, "summary", "days", year, `${month}.json`), JSON.stringify(dailyData, null, 2));
                    if (monthlySum)
                        monthlyData[parseInt(month)] = monthlySum;
                }
                if (Object.keys(monthlyData).length)
                    await common_1.write(path_1.join(".", "data", `google-fit-${category}`, "summary", "months", `${year}.json`), JSON.stringify(monthlyData, null, 2));
                if (yearlySum)
                    yearData[parseInt(year)] = yearlySum;
            }
            if (Object.keys(yearData).length)
                await common_1.write(path_1.join(".", "data", `google-fit-${category}`, "summary", "years.json"), JSON.stringify(yearData, null, 2));
        }
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
