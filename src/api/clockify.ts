import { config, cosmicSync } from "@anandchowdhary/cosmic";
import axios from "axios";
cosmicSync("life");

const apiKey = config("clockifyApiKey");
const workspaceId = config("clockifyWorkspaceId");
const userId = config("clockifyUserId");

const getTimeData = async () => {
  const { data } = await axios.get(
    `https://api.clockify.me/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries`,
    {
      headers: {
        "X-Api-Key": apiKey,
      },
    }
  );
  console.log(data);
};
getTimeData();

export const getUserId = async () => {
  const { data } = await axios.get(`https://api.clockify.me/api/v1/user`, {
    headers: {
      "X-Api-Key": apiKey,
    },
  });
  console.log("User ID", data.id);
};
