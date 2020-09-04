import "./common";
import { config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { readdir, pathExists, lstat } from "fs-extra";
import recursiveReaddir from "recursive-readdir";
import Dot from "dot-object";
import { write } from "./common";
const dot = new Dot("/");

import { summary as spotify } from "./api/spotify";
import { summary as rescueTime } from "./api/rescuetime";
import { summary as lastFm } from "./api/last-fm";
import { summary as pocketCasts } from "./api/pocket-casts";
import { summary as wakatime } from "./api/wakatime";
import { summary as clockify } from "./api/clockify";
import { summary as googleFit } from "./api/google-fit";
import { summary as ouraRing } from "./api/oura-ring";
import { summary as goodreads } from "./api/goodreads";

(async () => {
  if (config("daily").includes("spotify")) await spotify();
  if (config("daily").includes("rescueTime")) await rescueTime();
  if (config("daily").includes("pocketCasts")) await pocketCasts();
  if (config("daily").includes("wakatime")) await wakatime();
  if (config("daily").includes("lastFm")) await lastFm();
  if (config("daily").includes("clockify")) await clockify();
  if (config("daily").includes("googleFit")) await googleFit();
  if (config("daily").includes("ouraRing")) await ouraRing();
  if (config("daily").includes("goodreads")) await goodreads();

  const categories = await readdir(join(".", "data"));
  for await (const category of categories) {
    if (
      (await pathExists(join(".", "data", category, "summary"))) &&
      (await lstat(join(".", "data", category, "summary"))).isDirectory()
    ) {
      const files = (
        await recursiveReaddir(join(".", "data", category, "summary"))
      )
        .map(
          (path) => path.split(`${join(".", "data", category, "summary")}/`)[1]
        )
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      const data: any = {};
      files.forEach((file) => {
        const path = file.split("/").map((v) => `_check_${v}`);
        const prefix = path.join("/") === "" ? "root" : path.join("/");
        data[prefix] = true;
      });
      const items = recursivelyClean2(
        recursivelyClean1(
          JSON.parse(JSON.stringify(dot.object(data)).replace(/_check_/g, ""))
        )
      );
      await write(
        join(".", "data", category, "api.json"),
        JSON.stringify(items, null, 2)
      );
    }
  }
})();

function recursivelyClean1(items: any) {
  if (typeof items === "object" && !Array.isArray(items)) {
    Object.keys(items).forEach((key) => {
      if (items[key] === true) {
        items[key.replace(".json", "")] = key;
        delete items[key];
      } else {
        items[key] = recursivelyClean1(items[key]);
      }
    });
  }
  return items;
}

function recursivelyClean2(items: any) {
  if (typeof items === "object") {
    Object.keys(items).forEach((key) => {
      if (typeof items[key] === "object") {
        let allStrings = true;
        Object.values(items[key]).forEach((value) => {
          if (typeof value !== "string") allStrings = false;
        });
        if (!allStrings) {
          items[key] = recursivelyClean2(items[key]);
        } else {
          items[key] = Object.values(items[key]);
        }
      }
    });
  }
  return items;
}
