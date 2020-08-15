import "./common";
import { daily as spotify } from "./api/spotify";
import { daily as rescueTime } from "./api/rescue-time";
import { daily as pocketCasts } from "./api/pocket-casts";
import { daily as wakatime } from "./api/wakatime";

(async () => {
  await spotify();
  await rescueTime();
  await pocketCasts();
  await wakatime();
})();
