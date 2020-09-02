import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { write } from "../common";
import PromisePool from "es6-promise-pool";
import dayjs from "dayjs";
import week from "dayjs/plugin/weekOfYear";
import { WakaTimeClient } from "wakatime-client";
dayjs.extend(week);
cosmicSync("life");

const client = new WakaTimeClient(config("wakatimeApiKey"));

const updateWakatimeDailyData = async (date: Date) => {
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  console.log("WakaTime: Adding data for", formattedDate);
  const summary = await client.getMySummary({
    dateRange: {
      startDate: formattedDate,
      endDate: formattedDate,
    },
  });
  if (summary.data.length) {
    const startDate = dayjs(summary.start).format("YYYY/MM/DD");
    await write(
      join(
        ".",
        "data",
        "time-tracking",
        "wakatime",
        "daily",
        startDate,
        "daily-summary.json"
      ),
      JSON.stringify(summary.data, null, 2)
    );
  }
};

export const daily = async () => {
  console.log("WakaTime: Starting...");
  await updateWakatimeDailyData(dayjs().subtract(1, "day").toDate());
  console.log("WakaTime: Added yesterday's data");
  await updateWakatimeDailyData(dayjs().toDate());
  console.log("WakaTime: Added today's data");
  await updateWakatimeDailyData(dayjs().add(1, "day").toDate());
  console.log("WakaTime: Added tomorrow's data");
  console.log("WakaTime: Added daily summaries");
};

export const legacy = async () => {
  const CONCURRENCY = 3;
  const startDate = dayjs("2020-07-20");
  let count = 0;
  const pool = new PromisePool(async () => {
    const date = dayjs(startDate).add(count, "day");
    if (dayjs().diff(date, "day") === 0) return null;
    count++;
    return updateWakatimeDailyData(date.toDate());
  }, CONCURRENCY);
  await pool.start();
  console.log("Done!");
};

export const summary = async () => {};
