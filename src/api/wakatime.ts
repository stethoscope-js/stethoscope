import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { write } from "../common";
import PromisePool from "es6-promise-pool";
import dayjs from "dayjs";
import week from "dayjs/plugin/weekOfYear";
import { WakaTimeClient } from "wakatime-client";
import { pathExists, lstat, readdir, readJson } from "fs-extra";
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
        "wakatime-time-tracking",
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

export const summary = async () => {
  if (
    (await pathExists(join(".", "data", "wakatime-time-tracking", "daily"))) &&
    (
      await lstat(join(".", "data", "wakatime-time-tracking", "daily"))
    ).isDirectory()
  ) {
    const years = (
      await readdir(join(".", "data", "wakatime-time-tracking", "daily"))
    ).filter((i) => /^\d+$/.test(i));
    const yearData: { [index: string]: number } = {};
    for await (const year of years) {
      let yearlySum = 0;
      const monthlyData: { [index: string]: number } = {};
      [...Array(13).keys()]
        .slice(1)
        .forEach((val) => (monthlyData[val.toString()] = 0));
      const months = (
        await readdir(
          join(".", "data", "wakatime-time-tracking", "daily", year)
        )
      ).filter((i) => /^\d+$/.test(i));
      for await (const month of months) {
        let monthlySum = 0;
        const dailyData: { [index: string]: number } = {};
        [...Array(dayjs(`${year}-${month}-10`).daysInMonth()).keys()]
          .slice(1)
          .forEach((val) => (dailyData[val.toString()] = 0));
        const days = (
          await readdir(
            join(".", "data", "wakatime-time-tracking", "daily", year, month)
          )
        ).filter((i) => /^\d+$/.test(i));
        for await (const day of days) {
          let json = await readJson(
            join(
              ".",
              "data",
              "wakatime-time-tracking",
              "daily",
              year,
              month,
              day,
              "daily-summary.json"
            )
          );
          let dailySum = 0;
          if (Array.isArray(json)) {
            json.forEach((record: any) => {
              if (record.grand_total && record.grand_total.total_seconds) {
                dailySum += record.grand_total.total_seconds;
              }
            });
          }
          if (dailySum) dailyData[parseInt(day)] = dailySum;
          monthlySum += dailySum;
          yearlySum += dailySum;
        }
        if (Object.keys(dailyData).length)
          await write(
            join(
              ".",
              "data",
              "wakatime-time-tracking",
              "summary",
              "days",
              year,
              `${month}.json`
            ),
            JSON.stringify(dailyData, null, 2)
          );
        if (monthlySum) monthlyData[parseInt(month)] = monthlySum;
      }
      if (Object.keys(monthlyData).length)
        await write(
          join(
            ".",
            "data",
            "wakatime-time-tracking",
            "summary",
            "months",
            `${year}.json`
          ),
          JSON.stringify(monthlyData, null, 2)
        );
      if (yearlySum) yearData[parseInt(year)] = yearlySum;
    }
    if (Object.keys(yearData).length)
      await write(
        join(".", "data", "wakatime-time-tracking", "summary", "years.json"),
        JSON.stringify(yearData, null, 2)
      );
  }
};
