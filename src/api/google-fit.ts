import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { google, fitness_v1 } from "googleapis";
import { write } from "../common";
import { join } from "path";
import slugify from "@sindresorhus/slugify";
import dayjs from "dayjs";
import PromisePool from "es6-promise-pool";
import { readdir, readJson, pathExists, lstat } from "fs-extra";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import week from "dayjs/plugin/weekOfYear";

dayjs.extend(week);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);
cosmicSync("life");

const oauth2Client = new google.auth.OAuth2(
  config("googleFitClientId") ?? "example",
  config("googleFitClientSecret") ?? "example",
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({
  access_token: config("googleFitAccessToken") ?? "example",
  refresh_token: config("googleFitRefreshToken") ?? "example",
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
          `google-fit-${sessionType.replace(/_/g, "-")}`,
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
  for await (const day of [0, 1, 2, 3, 4]) {
    await updateGoogleFitDailyData(dayjs().subtract(day, "day").toDate());
    console.log("Google Fit: Added data");
  }
  console.log("Google Fit: Added daily summaries");
};

export const summary = async () => {
  for await (const category of [
    "aerobics",
    "archery",
    "badminton",
    "baseball",
    "basketball",
    "biathlon",
    "biking",
    "biking-hand",
    "biking-mountain",
    "biking-road",
    "biking-spinning",
    "biking-stationary",
    "biking-utility",
    "boxing",
    "calisthenics",
    "circuit-training",
    "cricket",
    "crossfit",
    "curling",
    "dancing",
    "diving",
    "elevator",
    "elliptical",
    "ergometer",
    "escalator",
    "extra-status",
    "fencing",
    "football-american",
    "football-australian",
    "football-soccer",
    "frisbee-disc",
    "gardening",
    "golf",
    "guided-breathing",
    "gymnastics",
    "handball",
    "high-intensity-interval-training",
    "hiking",
    "hockey",
    "horseback-riding",
    "housework",
    "ice-skating",
    "interval-training",
    "in-vehicle",
    "jump-rope",
    "kayaking",
    "kettlebell-training",
    "kickboxing",
    "kick-scooter",
    "kitesurfing",
    "martial-arts",
    "meditation",
    "mime-type-prefix",
    "mixed-martial-arts",
    "on-foot",
    "other",
    "p90x",
    "paragliding",
    "pilates",
    "polo",
    "racquetball",
    "rock-climbing",
    "rowing",
    "rowing-machine",
    "rugby",
    "running",
    "running-jogging",
    "running-sand",
    "running-treadmill",
    "sailing",
    "scuba-diving",
    "skateboarding",
    "skating",
    "skating-cross",
    "skating-indoor",
    "skating-inline",
    "skiing",
    "skiing-back-country",
    "skiing-cross-country",
    "skiing-downhill",
    "skiing-kite",
    "skiing-roller",
    "sledding",
    "sleep",
    "sleep-awake",
    "sleep-deep",
    "sleep-light",
    "sleep-rem",
    "snowboarding",
    "snowmobile",
    "snowshoeing",
    "softball",
    "squash",
    "stair-climbing",
    "stair-climbing-machine",
    "standup-paddleboarding",
    "status-active",
    "status-completed",
    "still",
    "strength-training",
    "surfing",
    "swimming",
    "swimming-open-water",
    "swimming-pool",
    "table-tennis",
    "team-sports",
    "tennis",
    "tilting",
    "treadmill",
    "unknown",
    "volleyball",
    "volleyball-beach",
    "volleyball-indoor",
    "wakeboarding",
    "walking",
    "walking-fitness",
    "walking-nordic",
    "walking-stroller",
    "walking-treadmill",
    "water-polo",
    "weightlifting",
    "wheelchair",
    "windsurfing",
    "yoga",
    "zumba",
  ]) {
    // Find all items that have daily
    if (
      (await pathExists(
        join(".", "data", `google-fit-${category}`, "daily")
      )) &&
      (
        await lstat(join(".", "data", `google-fit-${category}`, "daily"))
      ).isDirectory()
    ) {
      const years = (
        await readdir(join(".", "data", `google-fit-${category}`, "daily"))
      ).filter((i) => /^\d+$/.test(i));
      const yearData: { [index: string]: number } = {};
      const weeklyData: {
        [index: string]: {
          [index: string]: { [index: string]: number };
        };
      } = {};
      for await (const year of years) {
        let yearlySum = 0;
        const monthlyData: { [index: string]: number } = {};
        [...Array(13).keys()]
          .slice(1)
          .forEach((val) => (monthlyData[val.toString()] = 0));
        const months = (
          await readdir(
            join(".", "data", `google-fit-${category}`, "daily", year)
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
              join(".", "data", `google-fit-${category}`, "daily", year, month)
            )
          ).filter((i) => /^\d+$/.test(i));
          for await (const day of days) {
            let json = await readJson(
              join(
                ".",
                "data",
                `google-fit-${category}`,
                "daily",
                year,
                month,
                day,
                "sessions.json"
              )
            );
            let dailySum = 0;
            if (Array.isArray(json)) {
              // If it's a Google Fit health record
              try {
                json = json
                  .sort(
                    (a, b) =>
                      dayjs(a.startTime).unix() - dayjs(b.startTime).unix() ||
                      dayjs(a.endTime).unix() - dayjs(b.endTime).unix()
                  )
                  .reduce(
                    (r: Array<{ startTime: string; endTime: string }>, a) => {
                      const last = r[r.length - 1] || [];
                      if (
                        dayjs(last.startTime).unix() <=
                          dayjs(a.startTime).unix() &&
                        dayjs(a.startTime).unix() <= dayjs(last.endTime).unix()
                      ) {
                        if (
                          dayjs(last.endTime).unix() < dayjs(a.endTime).unix()
                        ) {
                          last.endTime = a.endTime;
                        }
                        return r;
                      }
                      return r.concat(a);
                    },
                    []
                  );
              } catch (error) {}
              json.forEach((record: any) => {
                if (record.startTime && record.endTime) {
                  dailySum += dayjs(record.endTime).diff(
                    record.startTime,
                    "second"
                  );
                } else if (record.total) {
                  dailySum += record.total;
                }
              });
            }
            if (dailySum) dailyData[parseInt(day)] = dailySum;
            monthlySum += dailySum;
            yearlySum += dailySum;
            Object.keys(dailyData).forEach((key) => {
              const weekNumber = dayjs(`${year}-${month}-${key}`).week();
              weeklyData[year] = weeklyData[year] ?? {};
              weeklyData[year][weekNumber] = weeklyData[year][weekNumber] ?? {};
              weeklyData[year][weekNumber][`${year}-${month}-${key}`] =
                dailyData[key];
            });
          }
          if (Object.keys(dailyData).length)
            await write(
              join(
                ".",
                "data",
                `google-fit-${category}`,
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
              `google-fit-${category}`,
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
          join(".", "data", `google-fit-${category}`, "summary", "years.json"),
          JSON.stringify(yearData, null, 2)
        );
      for await (const year of Object.keys(weeklyData)) {
        for await (const week of Object.keys(weeklyData[year])) {
          if (
            Object.keys(weeklyData[year][week]).length &&
            Object.values(weeklyData[year][week]).reduce((a, b) => a + b, 0)
          )
            await write(
              join(
                ".",
                "data",
                `google-fit-${category}`,
                "summary",
                "weeks",
                year,
                `${week}.json`
              ),
              JSON.stringify(weeklyData[year][week], null, 2)
            );
        }
      }
    }
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
