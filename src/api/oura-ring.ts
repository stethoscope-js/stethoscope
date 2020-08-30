import { cosmicSync, config } from "@anandchowdhary/cosmic";
import axios from "axios";
import { join } from "path";
import { write } from "../common";
import PromisePool from "es6-promise-pool";
import dayjs from "dayjs";
cosmicSync("life");

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
      "oura-ring",
      "daily",
      "weight",
      dayjs().format("YYYY"),
      dayjs().format("MM"),
      dayjs().format("DD"),
      "data.json"
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
      "oura-ring",
      "daily",
      "sleep",
      dayjs().format("YYYY"),
      dayjs().format("MM"),
      dayjs().format("DD"),
      "summary.json"
    ),
    JSON.stringify(sleepData, null, 2)
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
      "oura-ring",
      "daily",
      "readiness",
      dayjs().format("YYYY"),
      dayjs().format("MM"),
      dayjs().format("DD"),
      "summary.json"
    ),
    JSON.stringify(readinessData, null, 2)
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
      "oura-ring",
      "daily",
      "activity",
      dayjs().format("YYYY"),
      dayjs().format("MM"),
      dayjs().format("DD"),
      "summary.json"
    ),
    JSON.stringify(activityData, null, 2)
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
daily();

export const legacy = async () => {
  const CONCURRENCY = 10;
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
