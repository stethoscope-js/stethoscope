import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { google, fitness_v1 } from "googleapis";
import { write, zero } from "../common";
import { join } from "path";
import slugify from "@sindresorhus/slugify";
import dayjs from "dayjs";
import PromisePool from "es6-promise-pool";
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

const oauth2Client = new google.auth.OAuth2(
  config("googleFitClientId"),
  config("googleFitClientSecret"),
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({
  access_token: config("googleFitAccessToken"),
  refresh_token: config("googleFitRefreshToken"),
});
const fitness = google.fitness({ version: "v1", auth: oauth2Client });

const saveData = async (data: fitness_v1.Schema$Session[]) => {
  const itemsByDateAndType: {
    [index: string]: {
      [index: string]: Array<
        fitness_v1.Schema$Session & { startTime?: Date; endTime?: Date }
      >;
    };
  } = {};
  data.forEach((session) => {
    if (session.startTimeMillis && session.name) {
      const name = slugify(session.name);
      const date = dayjs(new Date(parseInt(session.startTimeMillis)));
      const year = date.format("YYYY");
      const month = date.format("MM");
      const day = date.format("DD");
      itemsByDateAndType[name] = itemsByDateAndType[name] ?? {};
      itemsByDateAndType[name][`${year}/${month}/${day}`] =
        itemsByDateAndType[name][`${year}/${month}/${day}`] ?? [];
      itemsByDateAndType[name][`${year}/${month}/${day}`].push({
        ...session,
        startTime: new Date(parseInt(session.startTimeMillis)),
        endTime: session.endTimeMillis
          ? new Date(parseInt(session.endTimeMillis))
          : undefined,
      });
    }
  });
  for await (const sessionType of Object.keys(itemsByDateAndType)) {
    for await (const sessionDate of Object.keys(
      itemsByDateAndType[sessionType]
    )) {
      await write(
        join(
          ".",
          "data",
          "health",
          sessionType,
          "daily",
          sessionDate,
          "sessions.json"
        ),
        JSON.stringify(itemsByDateAndType[sessionType][sessionDate], null, 2)
      );
    }
  }
};

const updateGoogleFitDailyData = async (date: Date) => {
  const sources = await fitness.users.sessions.list({
    userId: "me",
    startTime: dayjs(date).startOf("day").toISOString(),
    endTime: dayjs(date).endOf("day").toISOString(),
  });
  if (sources.data.session?.length) await saveData(sources.data.session);
  console.log(
    `Fetched ${
      sources.data.session?.length ?? 0
    } workout sessions for ${date.toLocaleDateString()}`
  );
  if (sources.data.session) await saveData(sources.data.session);
};

export const daily = async () => {
  console.log("Google Fit: Starting...");
  await updateGoogleFitDailyData(dayjs().subtract(1, "day").toDate());
  console.log("Google Fit: Added yesterday's data");
  await updateGoogleFitDailyData(dayjs().toDate());
  console.log("Google Fit: Added today's data");
  await updateGoogleFitDailyData(dayjs().add(1, "day").toDate());
  console.log("Google Fit: Added tomorrow's data");
  console.log("Google Fit: Added daily summaries");
};

export const summary = async () => {
  const types = await readdir(join(".", "data", "health"));
  for await (const dataType of types) {
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
          const _data: Array<{
            startTime: string;
            endTime: string;
          }> = await readJson(
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

          /**
           * Combine overlapping ranges
           * @source https://stackoverflow.com/a/42002001/1656944
           */
          const data = _data
            .sort(
              (a, b) =>
                dayjs(a.startTime).unix() - dayjs(b.startTime).unix() ||
                dayjs(a.endTime).unix() - dayjs(b.endTime).unix()
            )
            .reduce((r: Array<{ startTime: string; endTime: string }>, a) => {
              const last = r[r.length - 1] || [];
              if (
                dayjs(last.startTime).unix() <= dayjs(a.startTime).unix() &&
                dayjs(a.startTime).unix() <= dayjs(last.endTime).unix()
              ) {
                if (dayjs(last.endTime).unix() < dayjs(a.endTime).unix()) {
                  last.endTime = a.endTime;
                }
                return r;
              }
              return r.concat(a);
            }, []);
          let sum = 0;
          data.forEach((session) => {
            const seconds = dayjs(session.endTime).diff(
              dayjs(session.startTime),
              "second"
            );
            sum += seconds;
          });
          yearMonths[year] = yearMonths[year] ?? {};
          yearMonths[year][month] = yearMonths[year][month] ?? {};
          yearMonths[year][month][day] = sum;
          const weekNumber = dayjs(`${year}-${month}-${day}`).week().toString();
          weeks[year] = weeks[year] ?? {};
          weeks[year][weekNumber] = weeks[year][weekNumber] ?? {};
          weeks[year][weekNumber][day] = sum;
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
              "summary.json"
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
              "summary.json"
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
        join(".", "data", "health", dataType, "yearly", year, "summary.json"),
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
    console.log(`Google Fit: ${dataType} summaries generated`);
  }
};

export const legacy = async () => {
  const CONCURRENCY = 1;
  const startDate = dayjs("2020-07-29");
  let count = 0;
  const pool = new PromisePool(async () => {
    const date = dayjs(startDate).add(count, "day");
    if (dayjs().diff(date, "day") === 0) return null;
    count++;
    return updateGoogleFitDailyData(date.toDate());
  }, CONCURRENCY);
  await pool.start();
  console.log("Done!");
};
