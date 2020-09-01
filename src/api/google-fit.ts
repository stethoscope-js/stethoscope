import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { google, fitness_v1 } from "googleapis";
import { write, zero } from "../common";
import { join } from "path";
import slugify from "@sindresorhus/slugify";
import dayjs from "dayjs";
import PromisePool from "es6-promise-pool";
import { readdir, readJson } from "fs-extra";
import { CanvasRenderService } from "chartjs-node-canvas";

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
          "google-fit",
          "daily",
          sessionType,
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
  const types = await readdir(
    join(".", "data", "health", "google-fit", "daily")
  );
  for await (const dataType of types) {
    const yearMonths: any = {};
    const years = await readdir(
      join(".", "data", "health", "google-fit", "daily", dataType)
    );
    for await (const year of years) {
      const months = await readdir(
        join(".", "data", "health", "google-fit", "daily", dataType, year)
      );
      for await (const month of months) {
        const days = await readdir(
          join(
            ".",
            "data",
            "health",
            "google-fit",
            "daily",
            dataType,
            year,
            month
          )
        );
        for await (const day of days) {
          const data: Array<{
            startTime: string;
            endTime: string;
          }> = await readJson(
            join(
              ".",
              "data",
              "health",
              "google-fit",
              "daily",
              dataType,
              year,
              month,
              day,
              "sessions.json"
            )
          );
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
        }
      }
    }

    // Generate monthly summary
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
              "google-fit",
              "monthly",
              dataType,
              year,
              month.toString(),
              "summary.json"
            ),
            JSON.stringify(monthly, null, 2)
          );
          const image = await canvasRenderService.renderToBuffer({
            type: "line",
            data: {
              labels: Object.keys(monthly).map((day) =>
                dayjs(`${year}-${month}-${day}`).format("MMMM DD, YYYY")
              ),
              datasets: [
                {
                  backgroundColor: "#89e0cf",
                  borderColor: "#1abc9c",
                  data: Object.values(monthly),
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
              "google-fit",
              "monthly",
              dataType,
              year,
              month.toString(),
              "graph.png"
            ),
            image
          );
        }
      }
      await write(
        join(
          ".",
          "data",
          "health",
          "google-fit",
          "yearly",
          dataType,
          year,
          "summary.json"
        ),
        JSON.stringify(yearly, null, 2)
      );
      const image = await canvasRenderService.renderToBuffer({
        type: "line",
        data: {
          labels: Object.keys(yearly).map((month) =>
            dayjs(`${year}-${month}-06`).format("MMMM YYYY")
          ),
          datasets: [
            {
              backgroundColor: "#89e0cf",
              borderColor: "#1abc9c",
              data: Object.values(yearly),
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
          "google-fit",
          "yearly",
          dataType,
          year,
          "graph.png"
        ),
        image
      );
    }
    console.log(`Google Fit: ${dataType} summaries generated`);
  }
};
summary();

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
