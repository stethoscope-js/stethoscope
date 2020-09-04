import goodreads from "goodreads-api-node";
import { config, cosmicSync } from "@anandchowdhary/cosmic";
cosmicSync("life");

const userId = config("goodreadsUserId") ?? "example";

const api = goodreads(
  {
    key: config("goodreadsKey") ?? "example",
    secret: config("goodreadsSecret") ?? "example",
  },
  config("goodreadsCallbackUrl") ?? "http://localhost:3000/callback"
);

export const daily = async () => {
  for await (const shelf of (
    await api.getUserInfo(userId)
  ).user_shelves.user_shelf.map((shelf) => shelf.name)) {
    try {
      const books = await api.getBooksOnUserShelf(userId, shelf);
      console.log(books);
    } catch (error) {
      console.log(error);
    }
  }
};

export const summary = async () => {};
