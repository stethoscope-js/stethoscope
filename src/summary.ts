import "./common";
import { config } from "@anandchowdhary/cosmic";

import { summary as googleFit } from "./api/google-fit";

(async () => {
  if (config("daily").includes("googleFit")) await googleFit();
})();
