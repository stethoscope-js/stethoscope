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

export const daily = async () => {
  console.log("Rescue Time: Starting...");

  const dailySummary = (
    await axios.get(
      `https://www.rescuetime.com/anapi/daily_summary_feed?key=${config(
        "rescuetimeApiKey"
      )}`
    )
  ).data as RescueTimeDaily[];
  for await (const item of dailySummary) {
    const date = new Date(item.date);
    const year = zero(date.getUTCFullYear().toString());
    const month = zero((date.getUTCMonth() + 1).toString());
    const day = zero(date.getUTCDate().toString());
    await ensureDir(join(".", "data", "rescue-time", "daily", year, month));
    await writeFile(
      join(".", "data", "rescue-time", "daily", year, month, `${day}.json`),
      JSON.stringify(item, null, 2)
    );
  }
  console.log("Rescue Time: Added daily summaries");

  const weeklySummary = (
    await axios.get(
      `https://www.rescuetime.com/anapi/data?format=json&key=${config(
        "rescuetimeApiKey"
      )}&restrict_begin=${new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .slice(0, 10)}&restrict_end=${new Date().toISOString().slice(0, 10)}`
    )
  ).data as RescueTimeWeeklySummary;
  const headers = weeklySummary.row_headers;
  const items = weeklySummary.rows;
  const data: any = [];
  await ensureDir(join(".", "data", "rescue-time", "weekly"));
  items.forEach((item, index) => {
    if (index < 100) {
      const details: any = {};
      headers.forEach((header, index) => {
        details[header] = item[index];
      });
      data.push(details);
    }
  });
  await writeFile(
    join(".", "data", "rescue-time", "weekly", `${dayjs().week()}.json`),
    JSON.stringify(data, null, 2)
  );
  console.log("Rescue Time: Added weekly summaries");

  console.log("Rescue Time: Completed");
};
