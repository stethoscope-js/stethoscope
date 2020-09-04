import "./common";
import { config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { readdir, pathExists, lstat } from "fs-extra";
import recursiveReaddir from "recursive-readdir";

// import { summary as spotify } from "./api/spotify";
// import { summary as rescueTime } from "./api/rescuetime";
// import { summary as lastFm } from "./api/last-fm";
// import { summary as pocketCasts } from "./api/pocket-casts";
// import { summary as wakatime } from "./api/wakatime";
// import { summary as clockify } from "./api/clockify";
// import { summary as googleFit } from "./api/google-fit";
// import { summary as ouraRing } from "./api/oura-ring";
// import { summary as goodreads } from "./api/goodreads";

(async () => {
  // if (config("daily").includes("spotify")) await spotify();
  // if (config("daily").includes("rescueTime")) await rescueTime();
  // if (config("daily").includes("pocketCasts")) await pocketCasts();
  // if (config("daily").includes("wakatime")) await wakatime();
  // if (config("daily").includes("lastFm")) await lastFm();
  // if (config("daily").includes("clockify")) await clockify();
  // if (config("daily").includes("googleFit")) await googleFit();
  // if (config("daily").includes("ouraRing")) await ouraRing();
  // if (config("daily").includes("goodreads")) await goodreads();

  const categories = await readdir(join(".", "data"));
  for await (const category of categories) {
    if (
      (await pathExists(join(".", "data", category, "summary"))) &&
      (await lstat(join(".", "data", category, "summary"))).isDirectory()
    ) {
      const files = (
        await recursiveReaddir(join(".", "data", category, "summary"))
      ).map((path) =>
        path
          .split(`${join(".", "data", category, "summary")}/`)[1]
          .replace(/\./g, "__")
          .replace(/\//g, ".")
      );
      console.log(files, category);
    }
  }
})();
