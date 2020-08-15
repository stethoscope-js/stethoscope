import "./common";
import { weekly as wakatime } from "./api/wakatime";
import { config } from "@anandchowdhary/cosmic";

(async () => {
  if (config("weekly").includes("wakatime")) await wakatime();
})();
