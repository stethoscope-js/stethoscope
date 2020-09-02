import { cosmicSync, config } from "@anandchowdhary/cosmic";
import SpotifyAPI from "spotify-web-api-node";
import { join } from "path";
import { write } from "../common";
import dayjs from "dayjs";
import week from "dayjs/plugin/weekOfYear";
dayjs.extend(week);
cosmicSync("life");

/**
 * From `T` make a set of properties by key `K` become optional
 * @source https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts#L540
 */
type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

const api = new SpotifyAPI({
  clientId: config("spotifyClientId"),
  clientSecret: config("spotifyClientSecret"),
  redirectUri: config("spotifyCallbackUrl") ?? "http://localhost:3000/callback",
  accessToken: config("spotifyAccessToken"),
  refreshToken: config("spotifyRefreshToken"),
});

export const daily = async () => {
  console.log("Spotify: Starting...");
  const data = await api.refreshAccessToken();
  api.setAccessToken(data.body.access_token);
  console.log("Spotify: Refreshed access token");

  const history = await api.getMyRecentlyPlayedTracks();
  const itemsByDate: { [index: string]: Array<any> } = {};
  for await (const item of history.body.items) {
    const date = dayjs(item.played_at);
    const year = date.format("YYYY");
    const month = date.format("MM");
    const day = date.format("DD");
    itemsByDate[`${year}/${month}/${day}`] =
      itemsByDate[`${year}/${month}/${day}`] ?? [];
    itemsByDate[`${year}/${month}/${day}`].push(
      cleanSpotifyTrackResponse(item.track)
    );
  }
  for await (const key of Object.keys(itemsByDate)) {
    await write(
      join(
        ".",
        "data",
        "music",
        "spotify",
        "daily",
        key,
        "listening-history.json"
      ),
      JSON.stringify(itemsByDate[key], null, 2)
    );
  }
  console.log("Spotify: Added listening history");

  const date = dayjs();
  const year = date.format("YYYY");
  const month = date.format("MM");
  const day = date.format("DD");

  const library = await api.getMySavedTracks();
  const libraryItems = cleanSpotifyTracksResponse(
    library.body.items.map((item) => item.track)
  ).map((item, index) => ({
    ...item,
    date: library.body.items[index].added_at,
  }));
  await write(
    join(
      ".",
      "data",
      "music",
      "spotify",
      "daily",
      year,
      month,
      day,
      "library.json"
    ),
    JSON.stringify(libraryItems, null, 2)
  );
  console.log("Spotify: Added library");

  const shortTermTopTracks = cleanSpotifyTracksResponse(
    (await api.getMyTopTracks({ time_range: "short_term" })).body.items
  );
  await write(
    join(
      ".",
      "data",
      "music",
      "daily",
      year,
      month,
      day,
      "top-tracks",
      "short-term.json"
    ),
    JSON.stringify(shortTermTopTracks, null, 2)
  );
  console.log("Spotify: Added short-term top tracks");

  const mediumTermTopTracks = cleanSpotifyTracksResponse(
    (await api.getMyTopTracks({ time_range: "medium_term" })).body.items
  );
  await write(
    join(
      ".",
      "data",
      "music",
      "daily",
      year,
      month,
      day,
      "top-tracks",
      "medium-term.json"
    ),
    JSON.stringify(mediumTermTopTracks, null, 2)
  );
  console.log("Spotify: Added medium-term top tracks");

  const longTermTopTracks = cleanSpotifyTracksResponse(
    (await api.getMyTopTracks({ time_range: "long_term" })).body.items
  );
  await write(
    join(
      ".",
      "data",
      "music",
      "daily",
      year,
      month,
      day,
      "top-tracks",
      "long-term.json"
    ),
    JSON.stringify(longTermTopTracks, null, 2)
  );
  console.log("Spotify: Added long-term top tracks");

  const shortTermTopArtists = cleanSpotifyArtistsResponse(
    (await api.getMyTopArtists({ time_range: "short_term" })).body.items
  );
  await write(
    join(
      ".",
      "data",
      "music",
      "daily",
      year,
      month,
      day,
      "top-artists",
      "short-term.json"
    ),
    JSON.stringify(shortTermTopArtists, null, 2)
  );
  console.log("Spotify: Added short-term top artists");

  const mediumTermTopArtists = cleanSpotifyArtistsResponse(
    (await api.getMyTopArtists({ time_range: "medium_term" })).body.items
  );
  await write(
    join(
      ".",
      "data",
      "music",
      "daily",
      year,
      month,
      day,
      "top-artists",
      "medium-term.json"
    ),
    JSON.stringify(mediumTermTopArtists, null, 2)
  );
  console.log("Spotify: Added medium-term top artists");

  const longTermTopArtists = cleanSpotifyArtistsResponse(
    (await api.getMyTopArtists({ time_range: "long_term" })).body.items
  );
  await write(
    join(
      ".",
      "data",
      "music",
      "daily",
      year,
      month,
      day,
      "top-artists",
      "long-term.json"
    ),
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

const cleanSpotifyArtistResponse = (
  artist: Optional<
    SpotifyApi.ArtistObjectFull,
    "followers" | "external_urls" | "popularity"
  >
) => {
  delete artist.followers;
  delete artist.external_urls;
  delete artist.popularity;
  return artist;
};

const cleanSpotifyTrackResponse = (
  track:
    | Optional<
        SpotifyApi.TrackObjectFull,
        | "available_markets"
        | "disc_number"
        | "duration_ms"
        | "external_urls"
        | "id"
        | "is_playable"
        | "linked_from"
        | "type"
        | "track_number"
        | "uri"
        | "external_ids"
        | "popularity"
      >
    | Optional<
        SpotifyApi.TrackObjectSimplified,
        | "available_markets"
        | "disc_number"
        | "duration_ms"
        | "external_urls"
        | "id"
        | "type"
        | "is_playable"
        | "linked_from"
        | "track_number"
        | "uri"
      >
) => {
  delete track.available_markets;
  delete track.disc_number;
  delete track.duration_ms;
  delete track.external_urls;
  delete track.id;
  delete track.is_playable;
  delete track.linked_from;
  delete track.track_number;
  delete track.uri;
  delete track.type;
  if ("external_ids" in track) delete track.external_ids;
  if ("popularity" in track) delete track.popularity;
  if ("album" in track) {
    delete (track.album as any).album_type;
    delete (track.album as any).available_markets;
    delete (track.album as any).external_urls;
    delete (track.album as any).id;
  }
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

export const summary = async () => {};
