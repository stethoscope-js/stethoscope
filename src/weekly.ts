import "./common";
import { weekly as wakatime } from "./api/wakatime";

(async () => {
  await wakatime();
})();
