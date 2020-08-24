import { cosmicSync, config } from "@anandchowdhary/cosmic";
import axios from "axios";
import { join } from "path";
import { ensureDir, writeFile } from "fs-extra";
import dayjs from "dayjs";
import week from "dayjs/plugin/weekOfYear";
import { zero } from "../common";
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
  const formattedDate = new Date(date).toISOString().slice(0, 10);
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
  topCategoriesItems.forEach((item, index) => {
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
  topActivitiesItems.forEach((item, index) => {
    const details: any = {};
    topActivitiesHeaders.forEach((header, index) => {
      details[header] = item[index];
    });
    topActivitiesData.push(details);
  });

  const year = zero(date.getUTCFullYear().toString());
  const month = zero((date.getUTCMonth() + 1).toString());
  const day = zero(date.getUTCDate().toString());
  await ensureDir(join(".", "data", "rescue-time", "daily", year, month, day));
  await writeFile(
    join(
      ".",
      "data",
      "rescue-time",
      "daily",
      year,
      month,
      day,
      "top-categories.json"
    ),
    JSON.stringify(topCategoriesData, null, 2)
  );
  await writeFile(
    join(
      ".",
      "data",
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
  await updateRescueTimeDailyData(new Date());
  console.log("Rescue Time: Added daily summaries");
};
