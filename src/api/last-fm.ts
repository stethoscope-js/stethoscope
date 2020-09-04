import { cosmicSync, config } from "@anandchowdhary/cosmic";
import dayjs from "dayjs";
import LastFm from "@toplast/lastfm";
import { ITrack } from "@toplast/lastfm/lib/common/common.interface";
import { write } from "../common";
import { join } from "path";
import PromisePool from "es6-promise-pool";
import week from "dayjs/plugin/weekOfYear";
dayjs.extend(week);
cosmicSync("life");

const lastFm = new LastFm(config("lastfmApiKey") ?? "example");

const fetchTracks = async (date: Date, page = 1) => {
  const LIMIT = 50;
  const tracks = await lastFm.user.getRecentTracks({
    limit: LIMIT,
    page,
    user: config("lastfmUsername"),
    from: dayjs(date).startOf("day").unix(),
    to: dayjs(date).endOf("day").unix(),
  });
  if (tracks.recenttracks.track.length === LIMIT) {
    const moreTracks = await fetchTracks(date, page + 1);
    tracks.recenttracks.track.push(...moreTracks.recenttracks.track);
  }
  return tracks;
};

const getLastFmTracks = async (date: Date, page = 1) => {
  console.log("Last.fm: Fetching tracks for", dayjs(date).format("YYYY-MM-DD"));
  const tracks = await fetchTracks(date, page);
  const itemsByDate: { [index: string]: ITrack[] } = {};
  for await (const item of tracks.recenttracks.track) {
    const date = dayjs(Number(item.date?.uts) * 1000);
    const year = date.format("YYYY");
    const month = date.format("MM");
    const day = date.format("DD");
    itemsByDate[`${year}/${month}/${day}`] =
      itemsByDate[`${year}/${month}/${day}`] ?? [];
    itemsByDate[`${year}/${month}/${day}`].push(item);
  }
  for await (const key of Object.keys(itemsByDate)) {
    await write(
      join(
        ".",
        "data",
        "last-fm-music",
        "daily",
        key,
        "listening-history.json"
      ),
      JSON.stringify(itemsByDate[key], null, 2)
    );
  }
};

export const daily = async () => {
  console.log("Last.fm: Starting...");
  const date = dayjs();
  await getLastFmTracks(date.subtract(1, "day").toDate());
  console.log("Last.fm: Added yesterday's data");
  await getLastFmTracks(date.toDate());
  console.log("Last.fm: Added today's data");
  await getLastFmTracks(date.add(1, "day").toDate());
  console.log("Last.fm: Added tomorrow's data");
  console.log("Last.fm: Added daily summaries");

  const topAlbumsWeekly = await lastFm.user.getTopAlbums({
    user: config("lastfmUsername"),
    period: "7day",
    limit: 20,
  });
  console.log("Last.fm: Added 7-day top albums");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "weekly",
      "top-albums",
      date.format("YYYY"),
      `${date.week()}.json`
    ),
    JSON.stringify(topAlbumsWeekly.topalbums.album, null, 2)
  );

  const topTracksWeekly = await lastFm.user.getTopTracks({
    user: config("lastfmUsername"),
    period: "7day",
    limit: 20,
  });
  console.log("Last.fm: Added 7-day top tracks");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "weekly",
      "top-tracks",
      date.format("YYYY"),
      `${date.week()}.json`
    ),
    JSON.stringify(topTracksWeekly.toptracks.track, null, 2)
  );

  const topArtistsWeekly = await lastFm.user.getTopArtists({
    user: config("lastfmUsername"),
    period: "7day",
    limit: 20,
  });
  console.log("Last.fm: Added 7-day top artists");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "weekly",
      "top-artists",
      date.format("YYYY"),
      `${date.week()}.json`
    ),
    JSON.stringify(topArtistsWeekly.topartists.artist, null, 2)
  );

  const topAlbumsMonthly = await lastFm.user.getTopAlbums({
    user: config("lastfmUsername"),
    period: "1month",
    limit: 20,
  });
  console.log("Last.fm: Added 1-month top albums");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "monthly",
      "top-albums",
      date.format("YYYY"),
      `${date.format("MM")}.json`
    ),
    JSON.stringify(topAlbumsMonthly.topalbums.album, null, 2)
  );

  const topTracksMonthly = await lastFm.user.getTopTracks({
    user: config("lastfmUsername"),
    period: "1month",
    limit: 20,
  });
  console.log("Last.fm: Added 1-month top tracks");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "monthly",
      "top-tracks",
      date.format("YYYY"),
      `${date.format("MM")}.json`
    ),
    JSON.stringify(topTracksMonthly.toptracks.track, null, 2)
  );

  const topArtistsMonthly = await lastFm.user.getTopArtists({
    user: config("lastfmUsername"),
    period: "1month",
    limit: 20,
  });
  console.log("Last.fm: Added 1-month top artists");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "monthly",
      "top-artists",
      date.format("YYYY"),
      `${date.format("MM")}.json`
    ),
    JSON.stringify(topArtistsMonthly.topartists.artist, null, 2)
  );

  const topAlbumsYearly = await lastFm.user.getTopAlbums({
    user: config("lastfmUsername"),
    period: "12month",
    limit: 20,
  });
  console.log("Last.fm: Added 1-year top albums");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "yearly",
      "top-albums",
      `${date.format("YYYY")}.json`
    ),
    JSON.stringify(topAlbumsYearly.topalbums.album, null, 2)
  );

  const topTracksYearly = await lastFm.user.getTopTracks({
    user: config("lastfmUsername"),
    period: "12month",
    limit: 20,
  });
  console.log("Last.fm: Added 1-year top tracks");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "yearly",
      "top-tracks",
      `${date.format("YYYY")}.json`
    ),
    JSON.stringify(topTracksYearly.toptracks.track, null, 2)
  );

  const topArtistsYearly = await lastFm.user.getTopArtists({
    user: config("lastfmUsername"),
    period: "12month",
    limit: 20,
  });
  console.log("Last.fm: Added 1-year top artists");
  await write(
    join(
      ".",
      "data",
      "last-fm-music",
      "yearly",
      "top-artists",
      `${date.format("YYYY")}.json`
    ),
    JSON.stringify(topArtistsYearly.topartists.artist, null, 2)
  );

  console.log("Last.fm: Completed");
};

export const legacy = async () => {
  const CONCURRENCY = 10;
  const startDate = dayjs("2014-03-11");
  let count = 0;
  const pool = new PromisePool(async () => {
    const date = dayjs(startDate).add(count, "day");
    if (dayjs().diff(date, "day") === 0) return null;
    count++;
    return getLastFmTracks(date.toDate());
  }, CONCURRENCY);
  await pool.start();
  console.log("Done!");
};

export const summary = async () => {};
