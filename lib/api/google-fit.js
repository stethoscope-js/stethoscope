"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacy = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const googleapis_1 = require("googleapis");
const common_1 = require("../common");
const path_1 = require("path");
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const dayjs_1 = __importDefault(require("dayjs"));
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
            await common_1.write(path_1.join(".", "data", "health", sessionType, sessionDate, "sessions.json"), JSON.stringify(itemsByDateAndType[sessionType][sessionDate], null, 2));
        }
    }
    console.log("Google Fit: Added workout history");
};
exports.legacy = async (pageToken) => {
    const sources = await fitness.users.sessions.list({
        userId: "me",
        pageToken,
    });
    console.log(`Fetched ${sources.data.session?.length ?? 0} workout sessions`);
    // if (sources.data.session) await saveData(sources.data.session);
    console.log(sources.data.nextPageToken);
    if (sources.data.nextPageToken && sources.data.nextPageToken !== pageToken)
        await exports.legacy(sources.data.nextPageToken);
};
exports.legacy();
