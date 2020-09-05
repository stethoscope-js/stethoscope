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
        "clockify-time-tracking",
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
  for await (const day of [0, 1, 2, 3, 4]) {
    await getTimeData(dayjs().subtract(day, "day").toDate());
    console.log("Clockify: Added data");
  }
  console.log("Clockify: Added daily summaries");
};

export const getUserId = async () => {
  const { data } = await axios.get(`https://api.clockify.me/api/v1/user`, {
    headers: { "X-Api-Key": apiKey },
  });
  console.log("User ID", data.id);
};

export const summary = async () => {};
