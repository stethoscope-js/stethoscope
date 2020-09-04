import "./common";
import { config } from "@anandchowdhary/cosmic";

import { daily as spotify } from "./api/spotify";
import { daily as rescueTime } from "./api/rescuetime";
import { daily as lastFm } from "./api/last-fm";
import { daily as pocketCasts } from "./api/pocket-casts";
import { daily as wakatime } from "./api/wakatime";
import { daily as clockify } from "./api/clockify";
import { daily as googleFit } from "./api/google-fit";
import { daily as ouraRing } from "./api/oura-ring";
import { daily as goodreads } from "./api/goodreads";

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
})();
