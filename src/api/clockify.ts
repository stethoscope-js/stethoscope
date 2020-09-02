import { config, cosmicSync } from "@anandchowdhary/cosmic";
import axios from "axios";
import dayjs from "dayjs";
import { write } from "../common";
import { join } from "path";
cosmicSync("life");

const apiKey = config("clockifyApiKey");
const workspaceId = config("clockifyWorkspaceId");
const userId = config("clockifyUserId");

type ClockifyResult = {
  description?: string;
  id?: string;
  userId?: string;
  projectId?: string;
  workspaceId?: string;
  timeInterval: {
    start: string;
    end: string;
    duration: string;
  };
}[];

const getTimeData = async (date: Date) => {
  const {
    data,
  }: {
    data: ClockifyResult;
  } = await axios.get(
    `https://api.clockify.me/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries?start=${encodeURIComponent(
      dayjs(date).toISOString()
    )}&end=${encodeURIComponent(dayjs(date).toISOString())}`,
    {
      headers: { "X-Api-Key": apiKey },
    }
  );
  const items = data.map((item) => {
    delete item.description;
    delete item.userId;
    delete item.projectId;
    delete item.workspaceId;
    delete item.id;
    return item;
  });
  const itemsByDate: { [index: string]: ClockifyResult } = {};
  for await (const item of items) {
    const date = dayjs(item.timeInterval.start);
    const year = date.format("YYYY");
    const month = date.format("MM");
    const day = date.format("DD");
    itemsByDate[`${year}/${month}/${day}`] =
      itemsByDate[`${year}/${month}/${day}`] ?? [];
    itemsByDate[`${year}/${month}/${day}`].push(item);
  }
  for await (const key of Object.keys(itemsByDate)) {
    await write(
      join(
        ".",
        "data",
        "time-tracking",
        "clockify",
        "daily",
        key,
        "time-entries.json"
      ),
      JSON.stringify(itemsByDate[key], null, 2)
    );
  }
  console.log("Clockify: Added time tracking data");
};

export const daily = async () => {
  console.log("Clockify: Starting...");
  await getTimeData(dayjs().subtract(1, "day").toDate());
  console.log("Clockify: Added yesterday's data");
  await getTimeData(dayjs().toDate());
  console.log("Clockify: Added today's data");
  await getTimeData(dayjs().add(1, "day").toDate());
  console.log("Clockify: Added tomorrow's data");
  console.log("Clockify: Added daily summaries");
};

export const getUserId = async () => {
  const { data } = await axios.get(`https://api.clockify.me/api/v1/user`, {
    headers: { "X-Api-Key": apiKey },
  });
  console.log("User ID", data.id);
};

export const summary = async () => {};
