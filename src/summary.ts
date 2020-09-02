import "./common";
import { config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { readdir, lstatSync } from "fs-extra";
import { write } from "./common";
import recursiveReaddir from "recursive-readdir";

import { summary as spotify } from "./api/spotify";
import { summary as rescueTime } from "./api/rescue-time";
import { summary as lastFm } from "./api/last-fm";
import { summary as pocketCasts } from "./api/pocket-casts";
import { summary as wakatime } from "./api/wakatime";
import { summary as clockify } from "./api/clockify";
import { summary as googleFit } from "./api/google-fit";
import { summary as ouraRing } from "./api/oura-ring";
import { summary as goodreads } from "./api/goodreads";

const apiSummary = async () => {
  const dataTypes = (await readdir(join(".", "data"))).filter((i) =>
    lstatSync(join(".", "data", i)).isDirectory()
  );
  for await (const type of dataTypes) {
    const services = (await readdir(join(".", "data", type))).filter((i) =>
      lstatSync(join(".", "data", type, i)).isDirectory()
    );
    for await (const service of services) {
      const durations = (
        await readdir(join(".", "data", type, service))
      ).filter(
        (i) =>
          lstatSync(join(".", "data", type, service, i)).isDirectory() &&
          i !== "api"
      );
      for await (const duration of durations) {
        let data: any = {};
        data.items = (
          await recursiveReaddir(join(".", "data", type, service, duration))
        )
          .sort((a, b) =>
            a.localeCompare(b, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          )
          .filter((item) => !item.endsWith(".DS_Store"));
        await write(
          join(".", "data", type, service, "api", `${duration}.json`),
          JSON.stringify(data, null, 2)
        );
      }
    }
  }
};

(async () => {
  if (config("summary").includes("spotify")) await spotify();
  if (config("summary").includes("rescueTime")) await rescueTime();
  if (config("summary").includes("pocketCasts")) await pocketCasts();
  if (config("summary").includes("wakatime")) await wakatime();
  if (config("summary").includes("lastFm")) await lastFm();
  if (config("summary").includes("clockify")) await clockify();
  if (config("summary").includes("googleFit")) await googleFit();
  if (config("summary").includes("ouraRing")) await ouraRing();
  if (config("summary").includes("goodreads")) await goodreads();
  await apiSummary();
})();
