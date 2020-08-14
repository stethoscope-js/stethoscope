import { cosmicSync, config } from "@anandchowdhary/cosmic";
import SpotifyAPI from "spotify-web-api-node";
cosmicSync("life");

const api = new SpotifyAPI({
  clientId: config("spotifyClientId"),
  clientSecret: config("spotifyClientSecret"),
  redirectUri: config("spotifyCallbackUrl") ?? "http://localhost:3000/callback",
  accessToken: config("spotifyAccessToken"),
  refreshToken: config("spotifyRefreshToken"),
});

export const spotify = async () => {};

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
