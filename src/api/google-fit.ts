import { cosmicSync, config } from "@anandchowdhary/cosmic";
import { google, fitness_v1 } from "googleapis";
import { write } from "../common";
import { join } from "path";
import slugify from "@sindresorhus/slugify";
import dayjs from "dayjs";
cosmicSync("life");

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
        join(".", "data", "health", sessionType, sessionDate, "sessions.json"),
        JSON.stringify(itemsByDateAndType[sessionType][sessionDate], null, 2)
      );
    }
  }
  console.log("Google Fit: Added workout history");
};

export const legacy = async (pageToken?: string) => {
  const sources = await fitness.users.sessions.list({
    userId: "me",
    pageToken,
  });
  console.log(`Fetched ${sources.data.session?.length ?? 0} workout sessions`);
  if (sources.data.session) await saveData(sources.data.session);
  if (sources.data.nextPageToken) await legacy(sources.data.nextPageToken);
};

legacy();
