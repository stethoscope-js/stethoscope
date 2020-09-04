import "./common";
import { config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { readdir, lstatSync, lstat, pathExists, readJson } from "fs-extra";
import { write, zero } from "./common";
import recursiveReaddir from "recursive-readdir";
import dayjs from "dayjs";

export const summary = async () => {
  /**
   * Generate health summaries
   */
  const healthCategories = await readdir(join(".", "data", "health"));
  for await (const category of healthCategories) {
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

summary();
