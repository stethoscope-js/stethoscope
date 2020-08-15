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

export const callbackUrl = () =>
  api.initOAuth(
    config("goodreadsCallbackUrl") ?? "http://localhost:3000/callback"
  );
