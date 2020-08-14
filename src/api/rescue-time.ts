import { cosmicSync, config } from "@anandchowdhary/cosmic";
import axios from "axios";
import { join } from "path";
import { ensureDir, writeFile } from "fs-extra";
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

export const update = async () => {
  console.log("Rescue Time: Starting...");
  const data = (
    await axios.get(
      `https://www.rescuetime.com/anapi/daily_summary_feed?key=${config(
        "rescuetimeApiKey"
      )}`
    )
  ).data as RescueTimeDaily[];
  for await (const item of data) {
    const date = new Date(item.date);
    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString();
    const day = date.getUTCDate().toString();
    await ensureDir(join(".", "data", "rescue-time", "daily", year, month));
    await writeFile(
      join(".", "data", "rescue-time", "daily", year, month, `${day}.json`),
      JSON.stringify(item, null, 2)
    );
  }
  console.log("Rescue Time: Added daily summaries");
  console.log("Rescue Time: Completed");
};
