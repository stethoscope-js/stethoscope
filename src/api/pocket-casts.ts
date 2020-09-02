import PocketCasts from "pocketcasts";
import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { readdir, readJson } from "fs-extra";
import { write, zero } from "../common";
import dayjs from "dayjs";
import week from "dayjs/plugin/weekOfYear";
dayjs.extend(week);
cosmicSync("life");

const pocketCasts = new PocketCasts(
  config("pocketCastsUsername"),
  config("pocketCastsPassword")
);

export const daily = async () => {
  console.log("Pocket Casts: Starting...");
  await pocketCasts.login();

  const podcasts = (await pocketCasts.getList()).podcasts;
  await write(
    join(".", "data", "podcasts", "pocket-casts", "library.json"),
    JSON.stringify(podcasts, null, 2)
  );
  console.log("Pocket Casts: Added library");

  let items: Episode[] = [];
  try {
    const years = await readdir(
      join(".", "data", "podcasts", "pocket-casts", "daily")
    );
    const months = await readdir(
      join(
        ".",
        "data",
        "podcasts",
        "daily",
        zero(Math.max(...years.map(parseInt)).toString())
      )
    );
    const days = await readdir(
      join(
        ".",
        "data",
        "podcasts",
        "daily",
        zero(Math.max(...years.map(parseInt)).toString()),
        zero(Math.max(...months.map(parseInt)).toString())
      )
    );
    items = await readJson(
      join(
        ".",
        "data",
        "podcasts",
        "daily",
        zero(Math.max(...years.map(parseInt)).toString()),
        zero(Math.max(...months.map(parseInt)).toString()),
        zero(Math.max(...days.map(parseInt)).toString()),
        "listening-history.json"
      )
    );
  } catch (error) {}
  const history = await pocketCasts.getHistory();
  const newEpisodes: Episode[] = [];
  for (let episode of history.episodes) {
    if (items.find((item) => item.uuid === episode.uuid)) break;
    newEpisodes.push(episode);
  }
  const date = dayjs();
  const year = date.format("YYYY");
  const month = date.format("MM");
  const day = date.format("DD");
  await write(
    join(
      ".",
      "data",
      "podcasts",
      "pocket-casts",
      "daily",
      year,
      month,
      day,
      "listening-history.json"
    ),
    JSON.stringify(newEpisodes, null, 2)
  );
  console.log(`Pocket Casts: Added ${newEpisodes.length} new episodes`);

  console.log("Pocket Casts: Completed");
};

export const summary = async () => {};
