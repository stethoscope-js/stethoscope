"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = exports.legacy = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const dayjs_1 = __importDefault(require("dayjs"));
const lastfm_1 = __importDefault(require("@toplast/lastfm"));
const common_1 = require("../common");
const path_1 = require("path");
const es6_promise_pool_1 = __importDefault(require("es6-promise-pool"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
dayjs_1.default.extend(weekOfYear_1.default);
cosmic_1.cosmicSync("life");
const lastFm = new lastfm_1.default(cosmic_1.config("lastfmApiKey"));
const fetchTracks = async (date, page = 1) => {
    const LIMIT = 50;
    const tracks = await lastFm.user.getRecentTracks({
        limit: LIMIT,
        page,
        user: cosmic_1.config("lastfmUsername"),
        from: dayjs_1.default(date).startOf("day").unix(),
        to: dayjs_1.default(date).endOf("day").unix(),
    });
    if (tracks.recenttracks.track.length === LIMIT) {
        const moreTracks = await fetchTracks(date, page + 1);
        tracks.recenttracks.track.push(...moreTracks.recenttracks.track);
    }
    return tracks;
};
const getLastFmTracks = async (date, page = 1) => {
    console.log("Last.fm: Fetching tracks for", dayjs_1.default(date).format("YYYY-MM-DD"));
    const tracks = await fetchTracks(date, page);
    const itemsByDate = {};
    for await (const item of tracks.recenttracks.track) {
        const date = dayjs_1.default(Number(item.date?.uts) * 1000);
        const year = date.format("YYYY");
        const month = date.format("MM");
        const day = date.format("DD");
        itemsByDate[`${year}/${month}/${day}`] =
            itemsByDate[`${year}/${month}/${day}`] ?? [];
        itemsByDate[`${year}/${month}/${day}`].push(item);
    }
    for await (const key of Object.keys(itemsByDate)) {
        await common_1.write(path_1.join(".", "data", "music", "last-fm", "daily", key, "listening-history.json"), JSON.stringify(itemsByDate[key], null, 2));
    }
};
exports.daily = async () => {
    console.log("Last.fm: Starting...");
    const date = dayjs_1.default();
    await getLastFmTracks(date.subtract(1, "day").toDate());
    console.log("Last.fm: Added yesterday's data");
    await getLastFmTracks(date.toDate());
    console.log("Last.fm: Added today's data");
    await getLastFmTracks(date.add(1, "day").toDate());
    console.log("Last.fm: Added tomorrow's data");
    console.log("Last.fm: Added daily summaries");
    const topAlbumsWeekly = await lastFm.user.getTopAlbums({
        user: cosmic_1.config("lastfmUsername"),
        period: "7day",
        limit: 20,
    });
    console.log("Last.fm: Added 7-day top albums");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "weekly", "top-albums", date.format("YYYY"), `${date.week()}.json`), JSON.stringify(topAlbumsWeekly.topalbums.album, null, 2));
    const topTracksWeekly = await lastFm.user.getTopTracks({
        user: cosmic_1.config("lastfmUsername"),
        period: "7day",
        limit: 20,
    });
    console.log("Last.fm: Added 7-day top tracks");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "weekly", "top-tracks", date.format("YYYY"), `${date.week()}.json`), JSON.stringify(topTracksWeekly.toptracks.track, null, 2));
    const topArtistsWeekly = await lastFm.user.getTopArtists({
        user: cosmic_1.config("lastfmUsername"),
        period: "7day",
        limit: 20,
    });
    console.log("Last.fm: Added 7-day top artists");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "weekly", "top-artists", date.format("YYYY"), `${date.week()}.json`), JSON.stringify(topArtistsWeekly.topartists.artist, null, 2));
    const topAlbumsMonthly = await lastFm.user.getTopAlbums({
        user: cosmic_1.config("lastfmUsername"),
        period: "1month",
        limit: 20,
    });
    console.log("Last.fm: Added 1-month top albums");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "monthly", "top-albums", date.format("YYYY"), `${date.format("MM")}.json`), JSON.stringify(topAlbumsMonthly.topalbums.album, null, 2));
    const topTracksMonthly = await lastFm.user.getTopTracks({
        user: cosmic_1.config("lastfmUsername"),
        period: "1month",
        limit: 20,
    });
    console.log("Last.fm: Added 1-month top tracks");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "monthly", "top-tracks", date.format("YYYY"), `${date.format("MM")}.json`), JSON.stringify(topTracksMonthly.toptracks.track, null, 2));
    const topArtistsMonthly = await lastFm.user.getTopArtists({
        user: cosmic_1.config("lastfmUsername"),
        period: "1month",
        limit: 20,
    });
    console.log("Last.fm: Added 1-month top artists");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "monthly", "top-artists", date.format("YYYY"), `${date.format("MM")}.json`), JSON.stringify(topArtistsMonthly.topartists.artist, null, 2));
    const topAlbumsYearly = await lastFm.user.getTopAlbums({
        user: cosmic_1.config("lastfmUsername"),
        period: "12month",
        limit: 20,
    });
    console.log("Last.fm: Added 1-year top albums");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "yearly", "top-albums", `${date.format("YYYY")}.json`), JSON.stringify(topAlbumsYearly.topalbums.album, null, 2));
    const topTracksYearly = await lastFm.user.getTopTracks({
        user: cosmic_1.config("lastfmUsername"),
        period: "12month",
        limit: 20,
    });
    console.log("Last.fm: Added 1-year top tracks");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "yearly", "top-tracks", `${date.format("YYYY")}.json`), JSON.stringify(topTracksYearly.toptracks.track, null, 2));
    const topArtistsYearly = await lastFm.user.getTopArtists({
        user: cosmic_1.config("lastfmUsername"),
        period: "12month",
        limit: 20,
    });
    console.log("Last.fm: Added 1-year top artists");
    await common_1.write(path_1.join(".", "data", "music", "last-fm", "yearly", "top-artists", `${date.format("YYYY")}.json`), JSON.stringify(topArtistsYearly.topartists.artist, null, 2));
    console.log("Last.fm: Completed");
};
exports.legacy = async () => {
    const CONCURRENCY = 10;
    const startDate = dayjs_1.default("2014-03-11");
    let count = 0;
    const pool = new es6_promise_pool_1.default(async () => {
        const date = dayjs_1.default(startDate).add(count, "day");
        if (dayjs_1.default().diff(date, "day") === 0)
            return null;
        count++;
        return getLastFmTracks(date.toDate());
    }, CONCURRENCY);
    await pool.start();
    console.log("Done!");
};
exports.summary = async () => { };
