import goodreads from "goodreads";
import { config, cosmicSync } from "@anandchowdhary/cosmic";
cosmicSync("life");

const api = goodreads(
  {
    key: config("goodreadsKey"),
    secret: config("goodreadsSecret"),
  },
  config("goodreadsCallbackUrl")
);

export const callbackUrl = () => api.initOAuth(config("goodreadsCallbackUrl"));
