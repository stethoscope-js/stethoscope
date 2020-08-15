import { cosmicSync, config } from "@anandchowdhary/cosmic";
import SpotifyAPI from "spotify-web-api-node";
import { join } from "path";
import { ensureDir, writeFile, ensureFile } from "fs-extra";
import { zero } from "../common";
cosmicSync("life");

const api = new SpotifyAPI({
  clientId: config("spotifyClientId"),
  clientSecret: config("spotifyClientSecret"),
  redirectUri: config("spotifyCallbackUrl") ?? "http://localhost:3000/callback",
  accessToken: config("spotifyAccessToken"),
  refreshToken: config("spotifyRefreshToken"),
});

export const update = async () => {
  console.log("Spotify: Starting...");
  const data = await api.refreshAccessToken();
  api.setAccessToken(data.body.access_token);
  console.log("Spotify: Refreshed access token");
  await ensureDir(join(".", "data", "music"));

  const history = await api.getMyRecentlyPlayedTracks();
  const itemsByDate: { [index: string]: SpotifyApi.PlayHistoryObject[] } = {};
  for await (const item of history.body.items) {
    const date = new Date(item.played_at);
    const year = zero(date.getUTCFullYear().toString());
    const month = zero((date.getUTCMonth() + 1).toString());
    const day = zero(date.getUTCDate().toString());
    itemsByDate[`${year}/${month}/${day}`] =
      itemsByDate[`${year}/${month}/${day}`] ?? [];
    item.track = cleanSpotifyTrackResponse(item.track);
    itemsByDate[`${year}/${month}/${day}`].push(item);
  }
  for await (const key of Object.keys(itemsByDate)) {
    await ensureFile(join(".", "data", "music", "history", `${key}.json`));
    await writeFile(
      join(".", "data", "music", "history", `${key}.json`),
      JSON.stringify(itemsByDate[key], null, 2)
    );
  }
  console.log("Spotify: Added listening history");

  const library = await api.getMySavedTracks();
  const libraryItems = cleanSpotifyTracksResponse(
    library.body.items.map((item) => item.track)
  ).map((item, index) => ({
    ...item,
    date: library.body.items[index].added_at,
  }));
  await writeFile(
    join(".", "data", "music", "library.json"),
    JSON.stringify(libraryItems, null, 2)
  );
  console.log("Spotify: Added library");

  const shortTermTopTracks = cleanSpotifyTracksResponse(
    (await api.getMyTopTracks({ time_range: "short_term" })).body.items
  );
  await ensureDir(join(".", "data", "music", "top-tracks"));
  await writeFile(
    join(".", "data", "music", "top-tracks", "short-term.json"),
    JSON.stringify(shortTermTopTracks, null, 2)
  );
  console.log("Spotify: Added short-term top tracks");

  const mediumTermTopTracks = cleanSpotifyTracksResponse(
    (await api.getMyTopTracks({ time_range: "medium_term" })).body.items
  );
  await ensureDir(join(".", "data", "music", "top-tracks"));
  await writeFile(
    join(".", "data", "music", "top-tracks", "medium-term.json"),
    JSON.stringify(mediumTermTopTracks, null, 2)
  );
  console.log("Spotify: Added medium-term top tracks");

  const longTermTopTracks = cleanSpotifyTracksResponse(
    (await api.getMyTopTracks({ time_range: "long_term" })).body.items
  );
  await ensureDir(join(".", "data", "music", "top-tracks"));
  await writeFile(
    join(".", "data", "music", "top-tracks", "long-term.json"),
    JSON.stringify(longTermTopTracks, null, 2)
  );
  console.log("Spotify: Added long-term top tracks");

  const shortTermTopArtists = cleanSpotifyArtistsResponse(
    (await api.getMyTopArtists({ time_range: "short_term" })).body.items
  );
  await ensureDir(join(".", "data", "music", "top-artists"));
  await writeFile(
    join(".", "data", "music", "top-artists", "short-term.json"),
    JSON.stringify(shortTermTopArtists, null, 2)
  );
  console.log("Spotify: Added short-term top artists");

  const mediumTermTopArtists = cleanSpotifyArtistsResponse(
    (await api.getMyTopArtists({ time_range: "medium_term" })).body.items
  );
  await ensureDir(join(".", "data", "music", "top-artists"));
  await writeFile(
    join(".", "data", "music", "top-artists", "medium-term.json"),
    JSON.stringify(mediumTermTopArtists, null, 2)
  );
  console.log("Spotify: Added medium-term top artists");

  const longTermTopArtists = cleanSpotifyArtistsResponse(
    (await api.getMyTopArtists({ time_range: "long_term" })).body.items
  );
  await ensureDir(join(".", "data", "music", "top-artists"));
  await writeFile(
    join(".", "data", "music", "top-artists", "long-term.json"),
    JSON.stringify(longTermTopArtists, null, 2)
  );
  console.log("Spotify: Added long-term top artists");

  console.log("Spotify: Completed");
};

export const callbackUrl = async () => {
  const authorizeURL = api.createAuthorizeURL(
    ["user-top-read", "user-library-read"],
    "state"
  );
  console.log(authorizeURL);
};

export const authTokens = async (code: string) => {
  const { body } = await api.authorizationCodeGrant(code);
  console.log("Access token", body.access_token);
  console.log("Refresh token", body.refresh_token);
};

const cleanSpotifyArtistResponse = (artist: SpotifyApi.ArtistObjectFull) => {
  delete artist.followers;
  delete artist.external_urls;
  delete artist.popularity;
  return artist;
};

const cleanSpotifyTrackResponse = (
  track: SpotifyApi.TrackObjectFull | SpotifyApi.TrackObjectSimplified
) => {
  delete track.type;
  if ("external_ids" in track) delete (track as any).external_ids;
  if ("popularity" in track) delete (track as any).popularity;
  delete track.available_markets;
  delete track.disc_number;
  delete track.duration_ms;
  delete track.external_urls;
  delete track.id;
  delete track.is_playable;
  delete track.linked_from;
  delete track.track_number;
  delete track.uri;
  if ("external_ids" in track) delete (track as any).external_ids;
  if ("album" in track) delete (track as any).album.album_type;
  if ("album" in track) delete (track as any).album.available_markets;
  if ("album" in track) delete (track as any).album.external_urls;
  if ("album" in track) delete (track as any).album.id;
  delete track.type;
  delete track.uri;
  return track;
};

export const cleanSpotifyArtistsResponse = (
  artists: SpotifyApi.ArtistObjectFull[]
) => {
  return artists.map((artist) => cleanSpotifyArtistResponse(artist));
};

export const cleanSpotifyTracksResponse = (
  tracks: SpotifyApi.TrackObjectFull[]
) => {
  return tracks.map((track) => cleanSpotifyTrackResponse(track));
};
