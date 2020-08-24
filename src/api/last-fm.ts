import { cosmicSync, config } from "@anandchowdhary/cosmic";
import dayjs from "dayjs";
import LastFm from "@toplast/lastfm";
import { ITrack } from "@toplast/lastfm/lib/common/common.interface";
import { write } from "../common";
import { join } from "path";
cosmicSync("life");

const lastFm = new LastFm(config("lastfmApiKey"));

const getLastFmTracks = async (date: Date, page = 1) => {
  const LIMIT = 10;
  console.log("Last.fm: Fetching tracks for", dayjs(date).format("YYYY-MM-DD"));
  const tracks = await lastFm.user.getRecentTracks({
    limit: LIMIT,
    page,
    user: config("lastfmUsername"),
    from: dayjs(date).startOf("day").unix(),
    to: dayjs(date).endOf("day").unix(),
  });
  const itemsByDate: { [index: string]: ITrack[] } = {};
  for await (const item of tracks.recenttracks.track) {
    const date = dayjs(item.date?.uts);
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
  console.log(tracks.recenttracks.track);
  if (tracks.recenttracks.track.length === LIMIT) {
    console.log("Last.fm: Going to next page", page + 1);
    await getLastFmTracks(date, page + 1);
  }
};

getLastFmTracks(dayjs().subtract(1, "day").toDate());
