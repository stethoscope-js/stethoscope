import { cosmicSync, config } from "@anandchowdhary/cosmic";
import SpotifyAPI from "spotify-web-api-node";
import { join } from "path";
import { ensureDir, writeFile } from "fs-extra";
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
  const tracks = await api.getMySavedTracks();
  await ensureDir(join(".", "data", "music"));
  const items = cleanSpotifyTracksResponse(
    tracks.body.items.map((item) => item.track)
  ).map((item, index) => ({
    ...item,
    date: tracks.body.items[index].added_at,
  }));
  await writeFile(
    join(".", "data", "music", "library.json"),
    JSON.stringify(items, null, 2)
  );
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

const cleanSpotifyTrackResponse = (track: SpotifyApi.TrackObjectFull) => {
  delete track.type;
  delete track.external_ids;
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
  delete track.external_ids;
  delete track.album.album_type;
  delete track.album.available_markets;
  delete track.album.external_urls;
  delete track.album.id;
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
