# 🧬 Life

**⚠️ WARNING:** This is a new version of my [life-data](https://github.com/AnandChowdhary/life-data) and [services](https://github.com/AnandChowdhary/services) repositories, currently in an early stage. Expect breaking changes.

## 🌟 Features

### Supported services

<!-- prettier-ignore-start -->
| Service | API | Docs |
| ------- | --- | ------ |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/spotify-2.svg" width="12"> Spotify | [`src/api/spotify.ts`](./src/api/spotify.ts) | [Scroll to Docs ↓](#spotify) |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/last-fm-1.svg" width="12"> Last.fm | [`src/api/last-fm.ts`](./src/api/last-fm.ts) | [Scroll to Docs ↓](#last-fm) |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/wakatime.svg" width="12"> Rescue Time | [`src/api/rescue-time.ts`](./src/api/rescue-time.ts) | [Scroll to Docs ↓](#rescue-time) |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/wakatime.svg" width="12"> Wakatime | [`src/api/wakatime.ts`](./src/api/wakatime.ts) | [Scroll to Docs ↓](#wakatime) |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/wakatime.svg" width="12"> Pocket Casts | [`src/api/pocket-casts.ts`](./src/api/pocket-casts.ts) | [Scroll to Docs ↓](#pocket-casts) |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/wakatime.svg" width="12"> Goodreads | [`src/api/goodreads.ts`](./src/api/goodreads.ts) | ⌛ |
<!-- prettier-ignore-end -->

## 🛠️ Configuration

### Spotify

You need to register an application on [Spotify for Developers](https://developer.spotify.com) and will receieve a client ID and client secret. Use these credentials to generate an access/refresh token pair, which is used to authenticate with the Spotify API.

The [scopes](https://developer.spotify.com/documentation/general/guides/scopes/) required when generating credentials are:

- `user-top-read` (top artists and content)
- `user-library-read` ("Your Music" library)

When the tokens are generated, you can set the following environment variables:

| Environment variable    | Description   |
| ----------------------- | ------------- |
| `SPOTIFY_CLIENT_ID`     | Client ID     |
| `SPOTIFY_CLIENT_SECRET` | Client secret |
| `SPOTIFY_ACCESS_TOKEN`  | Access token  |
| `SPOTIFY_REFRESH_TOKEN` | Refresh token |

To generate tokens when you don't have a OAuth flow set up, add the default URL http://localhost:3000/callback under "Redirect URIs" in your Spotify app, and run the `callbackUrl` function:

```bash
node -e 'require("./lib/api/spotify").callbackUrl()'
```

Running the above will log the URL to visit in your web browser, for example:

```
https://accounts.spotify.com/authorize?client_id=557694afa2dc0589efcfe18e3e82bce6&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-top-read%20user-library-read&state=state
```

This URL will redirect you to a URL starting with http://localhost:3000/callback, which looks like this:

```
http://localhost:3000/callback?code=NDQ_cib1isb_nvYaShKXapeq7Q4GZHxs3ntGizJ9_kN27CG900qYeooVbjwhm81VUi1qH9v5WZ2GDExPmgMwMKh7_qWCQEj4ANsI-pjVqAyGcEQ_al6A2wNz_Rj1WsqLG370cNrkS94G30R0ycqfagS7TeIkdwjXa2rofa3yanGFL0QghTPZ1FW1LI_1JSPTpKZf-4Rv3gPzEQsGd3UrAdrkQRJt&state=state
```

In this above URL, the query parameter after `?code=` and before `&state=` is your `code`. You can exchange this for the required tokens, like so:

```bash
node -e 'require("./lib/api/spotify").authTokens("YOUR_CODE")'
```

This will log your access token and refresh token to the console. Copy and paste these and set them as the environment variables described above.

## Rescue Time

You need to provide your Rescue Time API key, which is available on your [API key management](https://www.rescuetime.com/anapi/manage) page on the Rescue Time website.

To generate a new API key, scroll to "Create a new API key" and enter a description under "Reference label". Click on "Activate this key" and copy the API key.

| Environment variable | Description |
| -------------------- | ----------- |
| `RESCUETIME_API_KEY` | API key     |

## Wakatime

You need to provide your WakaTime API key, which is available on the [Settings](https://wakatime.com/settings/account) page on the WakaTime website. Under "API key", click on "[click to show]" to view the API key and copy it.

| Environment variable | Description |
| -------------------- | ----------- |
| `WAKATIME_API_KEY`   | API key     |

## Pocket Casts

⚠️ **Warning:** This service does not support API key or OAuth authentication and requires your password.

You need to provide your Pocket Casts email address and password to access your data. The npm package [pocketcasts](https://www.npmjs.com/package/pocketcasts) is used to fetch your library and listening history. The package, in turn, sends HTTP requests simulating a login to the web app and uses the generated token to access your data ([see source](https://github.com/coughlanio/pocketcasts/blob/master/src/index.js)).

| Environment variable    | Description |
| ----------------------- | ----------- |
| `POCKET_CASTS_USERNAME` | Username    |
| `POCKET_CASTS_PASSWORD` | Password    |

## Goodreads

You can find your API key and secret on the [API key](https://www.goodreads.com/api/keys) page on the Goodreads website.

| Environment variable | Description |
| -------------------- | ----------- |
| `GOODREADS_KEY`      | API key     |
| `GOODREADS_SECRET`   | API secret  |

## Last.fm

You'll have to create an API account on https://www.last.fm/api/account/create. Since we don't require any tokens, you can add the default URL http://localhost:3000/callback under "Callback URL" in your Last.fm API account. When completed, you'll receive an API key and a shared secret.

| Environment variable   | Description   |
| ---------------------- | ------------- |
| `LASTFM_API_KEY`       | API key       |
| `LASTFM_SHARED_SECRET` | Shared secret |
