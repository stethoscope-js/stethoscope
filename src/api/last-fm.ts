import { cosmicSync, config } from "@anandchowdhary/cosmic";
import dayjs from "dayjs";
import LastFm from "@toplast/lastfm";
import { ITrack } from "@toplast/lastfm/lib/common/common.interface";
import { write } from "../common";
import { join } from "path";
import PromisePool from "es6-promise-pool";
cosmicSync("life");

const lastFm = new LastFm(config("lastfmApiKey"));

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
      join(".", "data", "music", "history", key, "listening-history.json"),
      JSON.stringify(itemsByDate[key], null, 2)
    );
  }
};

export const daily = async () => {
  console.log("Last.fm: Starting...");
  await getLastFmTracks(dayjs().subtract(1, "day").toDate());
  console.log("Last.fm: Added yesterday's data");
  await getLastFmTracks(dayjs().toDate());
  console.log("Last.fm: Added today's data");
  await getLastFmTracks(dayjs().add(1, "day").toDate());
  console.log("Last.fm: Added tomorrow's data");
  console.log("Last.fm: Added daily summaries");
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
