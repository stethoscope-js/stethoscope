import { cosmicSync, config } from "@anandchowdhary/cosmic";
import axios from "axios";
import { join } from "path";
import { write, zero } from "../common";
import PromisePool from "es6-promise-pool";
import dayjs from "dayjs";
import { readdir, readJson } from "fs-extra";
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
  const types = await readdir(join(".", "data", "health"));
  for await (const dataType of types.filter((type) => type !== "weight")) {
    const yearMonths: {
      [index: string]: { [index: string]: { [index: string]: number } };
    } = {};
    const weeks: {
      [index: string]: { [index: string]: { [index: string]: number } };
    } = {};
    const years = await readdir(join(".", "data", "health", dataType, "daily"));
    for await (const year of years) {
      const months = await readdir(
        join(".", "data", "health", dataType, "daily", year)
      );
      for await (const month of months) {
        const days = await readdir(
          join(".", "data", "health", dataType, "daily", year, month)
        );
        for await (const day of days) {
          let data: Array<{
            duration?: number;
            score?: number;
          }> = [];
          try {
            data = await readJson(
              join(
                ".",
                "data",
                "health",
                dataType,
                "daily",
                year,
                month,
                day,
                "sessions.json"
              )
            );
          } catch (error) {}
          let sum = 0;
          let hasSessionDuration = false;
          data.forEach((session) => {
            if (session.duration || session.score) {
              if (session.duration) sum += session.duration;
              else if (session.score) sum += session.score;
              hasSessionDuration = true;
            }
          });
          if (hasSessionDuration) {
            yearMonths[year] = yearMonths[year] ?? {};
            yearMonths[year][month] = yearMonths[year][month] ?? {};
            yearMonths[year][month][day] = sum;
            const weekNumber = dayjs(`${year}-${month}-${day}`)
              .week()
              .toString();
            weeks[year] = weeks[year] ?? {};
            weeks[year][weekNumber] = weeks[year][weekNumber] ?? {};
            weeks[year][weekNumber][day] = sum;
          }
        }
      }
    }

    // Generate weekly summary
    for await (const year of Object.keys(weeks)) {
      for await (const week of [
        ...Array(dayjs(`${year}-06-06`).isoWeeksInYear()).keys(),
      ].map((i) => i + 1)) {
        if (
          dayjs(`${year}-06-06`).week(week).startOf("week").isBefore(dayjs())
        ) {
          const days: { [index: string]: number } = {};
          const dayOne = dayjs(`${year}-06-06`).week(week).startOf("week");
          for (let i = 0; i < 7; i++) {
            const daySubtract = dayOne.subtract(i, "day");
            if (daySubtract.week() === week)
              days[daySubtract.format("YYYY-MM-DD")] =
                (weeks[year][week] ?? {})[daySubtract.format("D")] ?? 0;
            const dayAdd = dayOne.add(i, "day");
            if (dayAdd.week() === week)
              days[dayAdd.format("YYYY-MM-DD")] =
                (weeks[year][week] ?? {})[dayAdd.format("D")] ?? 0;
          }
          await write(
            join(
              ".",
              "data",
              "health",
              dataType,
              "weekly",
              year,
              week.toString(),
              "sessions.json"
            ),
            JSON.stringify(days, null, 2)
          );
          const image = await canvasRenderService.renderToBuffer({
            type: "bar",
            data: {
              labels: Object.keys(days).map((day) =>
                dayjs(day).format("MMMM DD, YYYY")
              ),
              datasets: [
                {
                  backgroundColor: "#89e0cf",
                  borderColor: "#1abc9c",
                  data: Object.values(days).map((val) => Number(val) / 3600),
                },
              ],
            },
            options: {
              legend: { display: false },
            },
          });
          await write(
            join(
              ".",
              "data",
              "health",
              dataType,
              "weekly",
              year,
              week.toString(),
              "graph.png"
            ),
            image
          );
        }
      }
    }

    // Generate monthly and yearly summary
    for await (const year of Object.keys(yearMonths)) {
      const yearly: { [index: number]: number } = {};
      for await (const month of [...Array(12).keys()].map((i) => i + 1)) {
        if (
          dayjs(
            `${year}-${zero(month.toString())}-${dayjs(month).daysInMonth()}`
          ).isBefore(dayjs())
        ) {
          let monthlySum = 0;
          const monthly: { [index: number]: number } = {};
          for (let i = 0; i < dayjs(month).daysInMonth(); i++) {
            const day = i + 1;
            if (
              dayjs(`${year}-${zero(month.toString())}-${day}`).isBefore(
                dayjs()
              )
            ) {
              monthly[day] =
                ((yearMonths[year] ?? {})[zero(month.toString())] ?? {})[
                  zero(day.toString())
                ] ?? 0;
              monthlySum += monthly[day];
            }
          }
          yearly[month] = monthlySum;
          await write(
            join(
              ".",
              "data",
              "health",
              dataType,
              "monthly",
              year,
              month.toString(),
              "sessions.json"
            ),
            JSON.stringify(monthly, null, 2)
          );
          const image = await canvasRenderService.renderToBuffer({
            type: "bar",
            data: {
              labels: Object.keys(monthly).map((day) =>
                dayjs(`${year}-${month}-${day}`).format("MMMM DD, YYYY")
              ),
              datasets: [
                {
                  backgroundColor: "#89e0cf",
                  borderColor: "#1abc9c",
                  data: Object.values(monthly).map((val) => Number(val) / 3600),
                },
              ],
            },
            options: {
              legend: { display: false },
            },
          });
          await write(
            join(
              ".",
              "data",
              "health",
              dataType,
              "monthly",
              year,
              month.toString(),
              "graph.png"
            ),
            image
          );
        }
      }
      await write(
        join(".", "data", "health", dataType, "yearly", year, "sessions.json"),
        JSON.stringify(yearly, null, 2)
      );
      const image = await canvasRenderService.renderToBuffer({
        type: "bar",
        data: {
          labels: Object.keys(yearly).map((month) =>
            dayjs(`${year}-${month}-06`).format("MMMM YYYY")
          ),
          datasets: [
            {
              backgroundColor: "#89e0cf",
              borderColor: "#1abc9c",
              data: Object.values(yearly).map((val) => Number(val) / 3600),
            },
          ],
        },
        options: {
          legend: { display: false },
        },
      });
      await write(
        join(".", "data", "health", dataType, "yearly", year, "graph.png"),
        image
      );
    }
    console.log(`Oura Ring: ${dataType} summaries generated`);
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
