import { cosmicSync, config } from "@anandchowdhary/cosmic";
import axios from "axios";
import { join } from "path";
import { write } from "../common";
import PromisePool from "es6-promise-pool";
import dayjs from "dayjs";
import week from "dayjs/plugin/weekOfYear";
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
      "time-tracking",
      "rescue-time",
      "daily",
      year,
      month,
      day,
      "top-categories.json"
    ),
    JSON.stringify(topCategoriesData, null, 2)
  );
  await write(
    join(
      ".",
      "data",
      "time-tracking",
      "rescue-time",
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

export const summary = async () => {};
