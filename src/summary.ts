import "./common";
import { config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { summary as googleFit } from "./api/google-fit";
import { readdir, lstatSync } from "fs-extra";
import { write } from "./common";

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
      let data: any = { durations: {} };
      for await (const duration of durations) {
        data.durations[duration] = data.durations[duration] ?? {};
        // data.durations[duration].items =
      }
      await write(
        join(".", "data", type, service, "api", "summary.json"),
        JSON.stringify(data, null, 2)
      );
    }
  }
};

(async () => {
  // if (config("daily").includes("googleFit")) await googleFit();
  await apiSummary();
})();
