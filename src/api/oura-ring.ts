import { cosmicSync, config } from "@anandchowdhary/cosmic";
import axios from "axios";
import { join } from "path";
import { write, zero } from "../common";
import PromisePool from "es6-promise-pool";
import dayjs from "dayjs";
import { readdir, readJson, pathExists, lstat } from "fs-extra";
import { CanvasRenderService } from "chartjs-node-canvas";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import week from "dayjs/plugin/weekOfYear";

dayjs.extend(week);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);
cosmicSync("life");
const canvasRenderService = new CanvasRenderService(1200, 800);

const updateOuraDailyData = async (date: Date) => {
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  const {
    data: healthData,
  }: {
    data: {
      age: number;
      weight: number;
      height: number;
      gender: string;
      email: string;
    };
  } = await axios.get(
    `https://api.ouraring.com/v1/userinfo?access_token=${config(
      "ouraPersonalAccessToken"
    )}`
  );
  await write(
    join(
      ".",
      "data",
      "health",
      "weight",
      "daily",
      dayjs(formattedDate).format("YYYY"),
      dayjs(formattedDate).format("MM"),
      dayjs(formattedDate).format("DD"),
      "sessions.json"
    ),
    JSON.stringify({ weight: healthData.weight }, null, 2)
  );
  console.log("Oura: Added summary data");
  const {
    data: sleepData,
  }: {
    data: {
      sleep: Array<{ summary_date: string }>;
    };
  } = await axios.get(
    `https://api.ouraring.com/v1/sleep?start=${formattedDate}&end=${formattedDate}&access_token=${config(
      "ouraPersonalAccessToken"
    )}`
  );
  console.log("Oura: Added sleep data");
  await write(
    join(
      ".",
      "data",
      "health",
      "oura-sleep",
      "daily",
      dayjs(formattedDate).format("YYYY"),
      dayjs(formattedDate).format("MM"),
      dayjs(formattedDate).format("DD"),
      "sessions.json"
    ),
    JSON.stringify(sleepData.sleep, null, 2)
  );
  const {
    data: readinessData,
  }: {
    data: {
      readiness: Array<{ summary_date: string }>;
    };
  } = await axios.get(
    `https://api.ouraring.com/v1/readiness?start=${formattedDate}&end=${formattedDate}&access_token=${config(
      "ouraPersonalAccessToken"
    )}`
  );
  console.log("Oura: Added readiness data");
  await write(
    join(
      ".",
      "data",
      "health",
      "readiness",
      "daily",
      dayjs(formattedDate).format("YYYY"),
      dayjs(formattedDate).format("MM"),
      dayjs(formattedDate).format("DD"),
      "sessions.json"
    ),
    JSON.stringify(readinessData.readiness, null, 2)
  );
  const {
    data: activityData,
  }: {
    data: {
      activity: Array<{ summary_date: string }>;
    };
  } = await axios.get(
    `https://api.ouraring.com/v1/activity?start=${formattedDate}&end=${formattedDate}&access_token=${config(
      "ouraPersonalAccessToken"
    )}`
  );
  console.log("Oura: Added activity data");
  await write(
    join(
      ".",
      "data",
      "health",
      "activity",
      "daily",
      dayjs(formattedDate).format("YYYY"),
      dayjs(formattedDate).format("MM"),
      dayjs(formattedDate).format("DD"),
      "sessions.json"
    ),
    JSON.stringify(activityData.activity, null, 2)
  );
};

export const daily = async () => {
  console.log("Oura: Starting...");
  await updateOuraDailyData(dayjs().subtract(1, "day").toDate());
  console.log("Oura: Added yesterday's data");
  await updateOuraDailyData(dayjs().toDate());
  console.log("Oura: Added today's data");
  await updateOuraDailyData(dayjs().add(1, "day").toDate());
  console.log("Oura: Added tomorrow's data");
  console.log("Oura: Added daily summaries");
};

export const summary = async () => {
  for await (const category of [
    "readiness",
    "activity",
    "weight",
    "oura-sleep",
  ]) {
    // Find all items that have daily
    if (
      (await pathExists(join(".", "data", "health", category, "daily"))) &&
      (
        await lstat(join(".", "data", "health", category, "daily"))
      ).isDirectory()
    ) {
      const years = (
        await readdir(join(".", "data", "health", category, "daily"))
      ).filter((i) => /^\d+$/.test(i));
      const yearData: { [index: string]: number } = {};
      for await (const year of years) {
        let yearlySum = 0;
        const monthlyData: { [index: string]: number } = {};
        [...Array(13).keys()]
          .slice(1)
          .forEach((val) => (monthlyData[val.toString()] = 0));
        const months = (
          await readdir(join(".", "data", "health", category, "daily", year))
        ).filter((i) => /^\d+$/.test(i));
        for await (const month of months) {
          let monthlySum = 0;
          const dailyData: { [index: string]: number } = {};
          [...Array(dayjs(`${year}-${month}-10`).daysInMonth()).keys()]
            .slice(1)
            .forEach((val) => (dailyData[val.toString()] = 0));
          const days = (
            await readdir(
              join(".", "data", "health", category, "daily", year, month)
            )
          ).filter((i) => /^\d+$/.test(i));
          for await (const day of days) {
            let json = await readJson(
              join(
                ".",
                "data",
                "health",
                category,
                "daily",
                year,
                month,
                day,
                "sessions.json"
              )
            );
            let dailySum = 0;
            if (Array.isArray(json)) {
              json.forEach((record: any) => {
                if (record.total) {
                  dailySum += record.total;
                }
              });
            }
            if (dailySum) dailyData[parseInt(day)] = dailySum;
            monthlySum += dailySum;
            yearlySum += dailySum;
          }
          if (Object.keys(dailyData).length)
            await write(
              join(".", "data", category, "days", year, `${month}.json`),
              JSON.stringify(dailyData, null, 2)
            );
          if (monthlySum) monthlyData[parseInt(month)] = monthlySum;
        }
        if (Object.keys(monthlyData).length)
          await write(
            join(".", "data", category, "months", `${year}.json`),
            JSON.stringify(monthlyData, null, 2)
          );
        if (yearlySum) yearData[parseInt(year)] = yearlySum;
      }
      if (Object.keys(yearData).length)
        await write(
          join(".", "data", category, "years.json"),
          JSON.stringify(yearData, null, 2)
        );
    }
  }
};

export const legacy = async () => {
  const CONCURRENCY = 1;
  const startDate = dayjs("2020-08-15");
  let count = 0;
  const pool = new PromisePool(async () => {
    const date = dayjs(startDate).add(count, "day");
    if (dayjs().diff(date, "day") === 0) return null;
    count++;
    return updateOuraDailyData(date.toDate());
  }, CONCURRENCY);
  await pool.start();
  console.log("Done!");
};
