import { cosmicSync, config } from "@anandchowdhary/cosmic";
import axios from "axios";
import { join } from "path";
import { write } from "../common";
import PromisePool from "es6-promise-pool";
import dayjs from "dayjs";
import week from "dayjs/plugin/weekOfYear";
import { pathExists, lstat, readdir, readJson } from "fs-extra";
dayjs.extend(week);
cosmicSync("life");

export interface RescueTimeDaily {
  id: number;
  date: string;
  productivity_pulse: number;
  very_productive_percentage: number;
  productive_percentage: number;
  neutral_percentage: number;
  distracting_percentage: number;
  very_distracting_percentage: number;
  all_productive_percentage: number;
  all_distracting_percentage: number;
  total_duration_formatted: string;
  very_productive_duration_formatted: string;
  productive_duration_formatted: string;
  neutral_duration_formatted: string;
  distracting_duration_formatted: string;
  very_distracting_duration_formatted: string;
  all_productive_duration_formatted: string;
  all_distracting_duration_formatted: string;
}

export interface RescueTimeWeeklySummary {
  row_headers: [string, string, string, string, string, string];
  rows: Array<[number, number, number, string, string, number]>;
}

const updateRescueTimeDailyData = async (date: Date) => {
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  console.log("Rescue Time: Adding data for", date);
  const topCategories = (
    await axios.get(
      `https://www.rescuetime.com/anapi/data?format=json&key=${config(
        "rescuetimeApiKey"
      )}&restrict_kind=category&restrict_begin=${formattedDate}&restrict_end=${formattedDate}`
    )
  ).data as RescueTimeWeeklySummary;
  const topCategoriesHeaders = topCategories.row_headers;
  const topCategoriesItems = topCategories.rows;
  const topCategoriesData: any = [];
  topCategoriesItems.forEach((item) => {
    const details: any = {};
    topCategoriesHeaders.forEach((header, index) => {
      details[header] = item[index];
    });
    topCategoriesData.push(details);
  });
  const topActivities = (
    await axios.get(
      `https://www.rescuetime.com/anapi/data?format=json&key=${config(
        "rescuetimeApiKey"
      )}&restrict_kind=activity&restrict_begin=${formattedDate}&restrict_end=${formattedDate}`
    )
  ).data as RescueTimeWeeklySummary;
  const topActivitiesHeaders = topActivities.row_headers;
  const topActivitiesItems = topActivities.rows;
  const topActivitiesData: any = [];
  topActivitiesItems.forEach((item) => {
    const details: any = {};
    topActivitiesHeaders.forEach((header, index) => {
      details[header] = item[index];
    });
    topActivitiesData.push(details);
  });

  const year = dayjs(date).format("YYYY");
  const month = dayjs(date).format("MM");
  const day = dayjs(date).format("DD");
  await write(
    join(
      ".",
      "data",
      "rescuetime-time-tracking",
      "daily",
      year,
      month,
      day,
      "top-categories.json"
    ),
    JSON.stringify(topCategoriesData, null, 2)
  );
  if (config("config")?.rescueTime?.trackTopActivities)
    await write(
      join(
        ".",
        "data",
        "rescuetime-time-tracking",
        "daily",
        year,
        month,
        day,
        "top-activities.json"
      ),
      JSON.stringify(topActivitiesData, null, 2)
    );
};

export const daily = async () => {
  console.log("Rescue Time: Starting...");
  await updateRescueTimeDailyData(dayjs().subtract(1, "day").toDate());
  console.log("Rescue Time: Added yesterday's data");
  await updateRescueTimeDailyData(dayjs().toDate());
  console.log("Rescue Time: Added today's data");
  await updateRescueTimeDailyData(dayjs().add(1, "day").toDate());
  console.log("Rescue Time: Added tomorrow's data");
  console.log("Rescue Time: Added daily summaries");
};

export const legacy = async () => {
  const CONCURRENCY = 10;
  const startDate = dayjs("2017-12-18");
  let count = 0;
  const pool = new PromisePool(async () => {
    const date = dayjs(startDate).add(count, "day");
    if (dayjs().diff(date, "day") === 0) return null;
    count++;
    return updateRescueTimeDailyData(date.toDate());
  }, CONCURRENCY);
  await pool.start();
  console.log("Done!");
};

export const summary = async () => {
  if (
    (await pathExists(
      join(".", "data", "rescuetime-time-tracking", "daily")
    )) &&
    (
      await lstat(join(".", "data", "rescuetime-time-tracking", "daily"))
    ).isDirectory()
  ) {
    const years = (
      await readdir(join(".", "data", "rescuetime-time-tracking", "daily"))
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
          join(".", "data", "rescuetime-time-tracking", "daily", year)
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
            join(".", "data", "rescuetime-time-tracking", "daily", year, month)
          )
        ).filter((i) => /^\d+$/.test(i));
        for await (const day of days) {
          let json = await readJson(
            join(
              ".",
              "data",
              "rescuetime-time-tracking",
              "daily",
              year,
              month,
              day,
              "top-categories.json"
            )
          );
          let dailySum = 0;
          if (Array.isArray(json)) {
            json.forEach((record: any) => {
              if (record["Time Spent (seconds)"]) {
                dailySum += record["Time Spent (seconds)"];
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
              "rescuetime-time-tracking",
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
            "rescuetime-time-tracking",
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
        join(".", "data", "rescuetime-time-tracking", "summary", "years.json"),
        JSON.stringify(yearData, null, 2)
      );
  }
};
