import goodreads from "goodreads-api-node";
import { config, cosmicSync } from "@anandchowdhary/cosmic";
cosmicSync("life");

const api = goodreads(
  {
    key: config("goodreadsKey"),
    secret: config("goodreadsSecret"),
  },
  config("goodreadsCallbackUrl") ?? "http://localhost:3000/callback"
);

export const daily = async () => {
  console.log(await api.getUserInfo(config("goodreadsUserId")));
};

export const callbackUrl = async () => {
  api.initOAuth(
    config("goodreadsCallbackUrl") ?? "http://localhost:3000/callback"
  );
  console.log(await api.getRequestToken());
};

export const authTokens = async () => {
  //
};
