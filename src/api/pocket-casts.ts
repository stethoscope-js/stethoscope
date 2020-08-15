import PocketCasts from "pocketcasts";
import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { zero } from "../common";
import { ensureDir, writeFile, readdir, readJson } from "fs-extra";
cosmicSync("life");

const pocketCasts = new PocketCasts(
  config("pocketCastsUsername"),
  config("pocketCastsPassword")
);

export const update = async () => {
  console.log("Pocket Casts: Starting...");
  await pocketCasts.login();

  // const podcasts = (await pocketCasts.getList()).podcasts;
  // await ensureDir(join(".", "data", "podcasts"));
  // await writeFile(
  //   join(".", "data", "podcasts", "library.json"),
  //   JSON.stringify(podcasts, null, 2)
  // );
  console.log("Pocket Casts: Added library");

  await ensureDir(join(".", "data", "podcasts", "history"));
  let items: Episode[] = [];
  try {
    const years = await readdir(join(".", "data", "podcasts", "history"));
    const months = await readdir(
      join(
        ".",
        "data",
        "podcasts",
        "history",
        zero(Math.max(...years.map(parseInt)).toString())
      )
    );
    const days = await readdir(
      join(
        ".",
        "data",
        "podcasts",
        "history",
        zero(Math.max(...years.map(parseInt)).toString()),
        zero(Math.max(...months.map(parseInt)).toString())
      )
    );
    items = await readJson(
      join(
        ".",
        "data",
        "podcasts",
        "history",
        zero(Math.max(...years.map(parseInt)).toString()),
        zero(Math.max(...months.map(parseInt)).toString()),
        `${zero(Math.max(...days.map(parseInt)).toString())}.json`
      )
    );
  } catch (error) {}
  const history = await pocketCasts.getHistory();
  const newEpisodes: Episode[] = [];
  for (let episode of history.episodes) {
    if (items.find((item) => item.uuid === episode.uuid)) break;
    newEpisodes.push(episode);
  }
  const date = new Date();
  const year = zero(date.getUTCFullYear().toString());
  const month = zero((date.getUTCMonth() + 1).toString());
  const day = zero(date.getUTCDate().toString());
  await ensureDir(join(".", "data", "podcasts", "history", year, month));
  await writeFile(
    join(".", "data", "podcasts", "history", year, month, `${day}.json`),
    JSON.stringify(newEpisodes, null, 2)
  );
  console.log(`Pocket Casts: Added ${newEpisodes.length} new episodes`);

  console.log("Pocket Casts: Completed");
};
