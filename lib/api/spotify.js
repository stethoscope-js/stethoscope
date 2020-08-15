"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanSpotifyTracksResponse = exports.cleanSpotifyArtistsResponse = exports.authTokens = exports.callbackUrl = exports.daily = void 0;
const cosmic_1 = require("@anandchowdhary/cosmic");
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const common_1 = require("../common");
cosmic_1.cosmicSync("life");
const api = new spotify_web_api_node_1.default({
    clientId: cosmic_1.config("spotifyClientId"),
    clientSecret: cosmic_1.config("spotifyClientSecret"),
    redirectUri: cosmic_1.config("spotifyCallbackUrl") ?? "http://localhost:3000/callback",
    accessToken: cosmic_1.config("spotifyAccessToken"),
    refreshToken: cosmic_1.config("spotifyRefreshToken"),
});
exports.daily = async () => {
    console.log("Spotify: Starting...");
    const data = await api.refreshAccessToken();
    api.setAccessToken(data.body.access_token);
    console.log("Spotify: Refreshed access token");
    await fs_extra_1.ensureDir(path_1.join(".", "data", "music"));
    const history = await api.getMyRecentlyPlayedTracks();
    const itemsByDate = {};
    for await (const item of history.body.items) {
        const date = new Date(item.played_at);
        const year = common_1.zero(date.getUTCFullYear().toString());
        const month = common_1.zero((date.getUTCMonth() + 1).toString());
        const day = common_1.zero(date.getUTCDate().toString());
        itemsByDate[`${year}/${month}/${day}`] =
            itemsByDate[`${year}/${month}/${day}`] ?? [];
        item.track = cleanSpotifyTrackResponse(item.track);
        itemsByDate[`${year}/${month}/${day}`].push(item);
    }
    for await (const key of Object.keys(itemsByDate)) {
        await fs_extra_1.ensureFile(path_1.join(".", "data", "music", "history", `${key}.json`));
        await fs_extra_1.writeFile(path_1.join(".", "data", "music", "history", `${key}.json`), JSON.stringify(itemsByDate[key], null, 2));
    }
    console.log("Spotify: Added listening history");
    const library = await api.getMySavedTracks();
    const libraryItems = exports.cleanSpotifyTracksResponse(library.body.items.map((item) => item.track)).map((item, index) => ({
        ...item,
        date: library.body.items[index].added_at,
    }));
    await fs_extra_1.writeFile(path_1.join(".", "data", "music", "library.json"), JSON.stringify(libraryItems, null, 2));
    console.log("Spotify: Added library");
    const shortTermTopTracks = exports.cleanSpotifyTracksResponse((await api.getMyTopTracks({ time_range: "short_term" })).body.items);
    await fs_extra_1.ensureDir(path_1.join(".", "data", "music", "top-tracks"));
    await fs_extra_1.writeFile(path_1.join(".", "data", "music", "top-tracks", "short-term.json"), JSON.stringify(shortTermTopTracks, null, 2));
    console.log("Spotify: Added short-term top tracks");
    const mediumTermTopTracks = exports.cleanSpotifyTracksResponse((await api.getMyTopTracks({ time_range: "medium_term" })).body.items);
    await fs_extra_1.ensureDir(path_1.join(".", "data", "music", "top-tracks"));
    await fs_extra_1.writeFile(path_1.join(".", "data", "music", "top-tracks", "medium-term.json"), JSON.stringify(mediumTermTopTracks, null, 2));
    console.log("Spotify: Added medium-term top tracks");
    const longTermTopTracks = exports.cleanSpotifyTracksResponse((await api.getMyTopTracks({ time_range: "long_term" })).body.items);
    await fs_extra_1.ensureDir(path_1.join(".", "data", "music", "top-tracks"));
    await fs_extra_1.writeFile(path_1.join(".", "data", "music", "top-tracks", "long-term.json"), JSON.stringify(longTermTopTracks, null, 2));
    console.log("Spotify: Added long-term top tracks");
    const shortTermTopArtists = exports.cleanSpotifyArtistsResponse((await api.getMyTopArtists({ time_range: "short_term" })).body.items);
    await fs_extra_1.ensureDir(path_1.join(".", "data", "music", "top-artists"));
    await fs_extra_1.writeFile(path_1.join(".", "data", "music", "top-artists", "short-term.json"), JSON.stringify(shortTermTopArtists, null, 2));
    console.log("Spotify: Added short-term top artists");
    const mediumTermTopArtists = exports.cleanSpotifyArtistsResponse((await api.getMyTopArtists({ time_range: "medium_term" })).body.items);
    await fs_extra_1.ensureDir(path_1.join(".", "data", "music", "top-artists"));
    await fs_extra_1.writeFile(path_1.join(".", "data", "music", "top-artists", "medium-term.json"), JSON.stringify(mediumTermTopArtists, null, 2));
    console.log("Spotify: Added medium-term top artists");
    const longTermTopArtists = exports.cleanSpotifyArtistsResponse((await api.getMyTopArtists({ time_range: "long_term" })).body.items);
    await fs_extra_1.ensureDir(path_1.join(".", "data", "music", "top-artists"));
    await fs_extra_1.writeFile(path_1.join(".", "data", "music", "top-artists", "long-term.json"), JSON.stringify(longTermTopArtists, null, 2));
    console.log("Spotify: Added long-term top artists");
    console.log("Spotify: Completed");
};
exports.callbackUrl = async () => {
    const authorizeURL = api.createAuthorizeURL(["user-top-read", "user-library-read"], "state");
    console.log(authorizeURL);
};
exports.authTokens = async (code) => {
    const { body } = await api.authorizationCodeGrant(code);
    console.log("Access token", body.access_token);
    console.log("Refresh token", body.refresh_token);
};
const cleanSpotifyArtistResponse = (artist) => {
    delete artist.followers;
    delete artist.external_urls;
    delete artist.popularity;
    return artist;
};
const cleanSpotifyTrackResponse = (track) => {
    delete track.type;
    if ("external_ids" in track)
        delete track.external_ids;
    if ("popularity" in track)
        delete track.popularity;
    delete track.available_markets;
    delete track.disc_number;
    delete track.duration_ms;
    delete track.external_urls;
    delete track.id;
    delete track.is_playable;
    delete track.linked_from;
    delete track.track_number;
    delete track.uri;
    if ("external_ids" in track)
        delete track.external_ids;
    if ("album" in track)
        delete track.album.album_type;
    if ("album" in track)
        delete track.album.available_markets;
    if ("album" in track)
        delete track.album.external_urls;
    if ("album" in track)
        delete track.album.id;
    delete track.type;
    delete track.uri;
    return track;
};
exports.cleanSpotifyArtistsResponse = (artists) => {
    return artists.map((artist) => cleanSpotifyArtistResponse(artist));
};
exports.cleanSpotifyTracksResponse = (tracks) => {
    return tracks.map((track) => cleanSpotifyTrackResponse(track));
};
