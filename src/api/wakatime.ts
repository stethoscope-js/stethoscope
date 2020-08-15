import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { ensureFile, writeFile } from "fs-extra";
import dayjs from "dayjs";
import { WakaTimeClient, RANGE } from "wakatime-client";
cosmicSync("life");

const client = new WakaTimeClient(config("wakatimeApiKey"));

export const daily = async () => {
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

export const weekly = async () => {
  const myStats = await client.getMyStats({ range: RANGE.LAST_7_DAYS });
  console.log(myStats);
  await writeFile(
    join(".", "data", "wakatime", "weekly", `${dayjs().week()}.json`),
    JSON.stringify(myStats.data, null, 2)
  );
  console.log("WakaTime: Added stats");
};
