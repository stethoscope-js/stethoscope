import PocketCasts from "pocketcasts";
import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { ensureDir, writeFile } from "fs-extra";
cosmicSync("life");

const pocketCasts = new PocketCasts(
  config("pocketCastsUsername"),
  config("pocketCastsPassword")
);

export const update = async () => {
  await pocketCasts.login();
  const podcasts = (await pocketCasts.getList()).podcasts;
  await ensureDir(join(".", "data", "podcasts"));
  await writeFile(
    join(".", "data", "podcasts", "library.json"),
    JSON.stringify(podcasts, null, 2)
  );
};
