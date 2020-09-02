"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = exports.daily = void 0;
const goodreads_api_node_1 = __importDefault(require("goodreads-api-node"));
const cosmic_1 = require("@anandchowdhary/cosmic");
cosmic_1.cosmicSync("life");
const userId = cosmic_1.config("goodreadsUserId");
const api = goodreads_api_node_1.default({
    key: cosmic_1.config("goodreadsKey"),
    secret: cosmic_1.config("goodreadsSecret"),
}, cosmic_1.config("goodreadsCallbackUrl") ?? "http://localhost:3000/callback");
exports.daily = async () => {
    for await (const shelf of (await api.getUserInfo(userId)).user_shelves.user_shelf.map((shelf) => shelf.name)) {
        try {
            const books = await api.getBooksOnUserShelf(userId, shelf);
            console.log(books);
        }
        catch (error) {
            console.log(error);
        }
    }
};
exports.summary = async () => { };
