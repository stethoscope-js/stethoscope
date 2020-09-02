"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = exports.getUserId = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const axios_1 = __importDefault(require("axios"));
const dayjs_1 = __importDefault(require("dayjs"));
const common_1 = require("../common");
const path_1 = require("path");
cosmic_1.cosmicSync("life");
const apiKey = cosmic_1.config("clockifyApiKey");
const workspaceId = cosmic_1.config("clockifyWorkspaceId");
const userId = cosmic_1.config("clockifyUserId");
const getTimeData = async (date) => {
    const { data, } = await axios_1.default.get(`https://api.clockify.me/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries?start=${encodeURIComponent(dayjs_1.default(date).toISOString())}&end=${encodeURIComponent(dayjs_1.default(date).toISOString())}`, {
        headers: { "X-Api-Key": apiKey },
    });
    const items = data.map((item) => {
        delete item.description;
        delete item.userId;
        delete item.projectId;
        delete item.workspaceId;
        delete item.id;
        return item;
    });
    const itemsByDate = {};
    for await (const item of items) {
        const date = dayjs_1.default(item.timeInterval.start);
        const year = date.format("YYYY");
        const month = date.format("MM");
        const day = date.format("DD");
        itemsByDate[`${year}/${month}/${day}`] =
            itemsByDate[`${year}/${month}/${day}`] ?? [];
        itemsByDate[`${year}/${month}/${day}`].push(item);
    }
    for await (const key of Object.keys(itemsByDate)) {
        await common_1.write(path_1.join(".", "data", "time-tracking", "clockify", "daily", key, "time-entries.json"), JSON.stringify(itemsByDate[key], null, 2));
    }
    console.log("Clockify: Added time tracking data");
};
exports.daily = async () => {
    console.log("Clockify: Starting...");
    await getTimeData(dayjs_1.default().subtract(1, "day").toDate());
    console.log("Clockify: Added yesterday's data");
    await getTimeData(dayjs_1.default().toDate());
    console.log("Clockify: Added today's data");
    await getTimeData(dayjs_1.default().add(1, "day").toDate());
    console.log("Clockify: Added tomorrow's data");
    console.log("Clockify: Added daily summaries");
};
exports.getUserId = async () => {
    const { data } = await axios_1.default.get(`https://api.clockify.me/api/v1/user`, {
        headers: { "X-Api-Key": apiKey },
    });
    console.log("User ID", data.id);
};
exports.summary = async () => { };
