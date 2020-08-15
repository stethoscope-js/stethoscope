import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { ensureFile, writeFile } from "fs-extra";
import dayjs from "dayjs";
import { WakaTimeClient } from "wakatime-client";
cosmicSync("life");

const client = new WakaTimeClient(config("wakatimeApiKey"));

export const update = async () => {
  console.log("WakaTime: Starting...");

  for await (const date of [
    dayjs().add(1, "day").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD"),
    dayjs().subtract(1, "day").format("YYYY-MM-DD"),
  ]) {
    const summary = await client.getMySummary({
      dateRange: {
        startDate: date,
        endDate: date,
      },
    });
    if (summary.data.length) {
      const startDate = dayjs(summary.start).format("YYYY/MM/DD");
      await ensureFile(
        join(".", "data", "wakatime", "history", `${startDate}.json`)
      );
      await writeFile(
        join(".", "data", "wakatime", "history", `${startDate}.json`),
        JSON.stringify(summary.data, null, 2)
      );
    }
  }
  console.log("WakaTime: Added daily summary");

  console.log("WakaTime: Completed");
};
