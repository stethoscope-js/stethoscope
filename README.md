# 🧬 Life

**⚠️ WARNING:** This is a new version of my [life-data](https://github.com/AnandChowdhary/life-data) and [services](https://github.com/AnandChowdhary/services) repositories, currently in an early stage. Expect breaking changes.

[![Daily CI](https://github.com/AnandChowdhary/life/workflows/Daily%20CI/badge.svg)](https://github.com/AnandChowdhary/life/actions?query=workflow%3A%22Daily+CI%22)
[![Weekly CI](https://github.com/AnandChowdhary/life/workflows/Weekly%20CI/badge.svg)](https://github.com/AnandChowdhary/life/actions?query=workflow%3A%22Weekly+CI%22)
[![Node CI](https://github.com/AnandChowdhary/life/workflows/Node%20CI/badge.svg)](https://github.com/AnandChowdhary/life/actions?query=workflow%3A%22Node+CI%22)

## 🌟 Features

### Tracked data

- Health (steps, workouts, sleep, etc.)
- Music and podcasts listening history
- Time tracking

### Supported services

<!-- prettier-ignore-start -->
| Service | API | Data | Docs |
| ------- | --- | ---- | ---- |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/spotify-2.svg" width="12"> Spotify | [`src/api/spotify.ts`](./src/api/spotify.ts) | [View data](./data/music) | [Scroll to Docs ↓](#spotify) |
| <img alt="" src="https://cdn2.iconfinder.com/data/icons/social-icon-3/512/social_style_3_lastfm-512.png" width="12"> Last.fm | [`src/api/last-fm.ts`](./src/api/last-fm.ts) | [View data](./data/music) | [Scroll to Docs ↓](#lastfm) |
| <img alt="" src="https://images.weserv.nl/?url=https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS5cnw0MQF7TnpSzlRTlIC6z4EHDEPP3B8qBw&usqp=CAU&w=64&h=64&fit=cover" width="12"> Rescue Time | [`src/api/rescue-time.ts`](./src/api/rescue-time.ts) | [View data](./data/rescue-time) | [Scroll to Docs ↓](#rescue-time) |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/wakatime.svg" width="12"> Wakatime | [`src/api/wakatime.ts`](./src/api/wakatime.ts) | [View data](./data/wakatime) | [Scroll to Docs ↓](#wakatime) |
| <img alt="" src="https://images.weserv.nl/?url=https://lh3.googleusercontent.com/23K9TDTOdlo57Pi9JvNtPc9K-utruK6jQEpQGD_E4QBLRJYRAgLcC7gF2Rd_0T1qhLLS&w=64&h=64&fit=cover&mask=circle" width="12"> Pocket Casts | [`src/api/pocket-casts.ts`](./src/api/pocket-casts.ts) | [View data](./data/podcasts) | [Scroll to Docs ↓](#pocket-casts) |
| <img alt="" src="https://images.weserv.nl/?url=https://icon-library.com/images/goodreads-icon/goodreads-icon-14.jpg&w=64&h=64&fit=cover&mask=circle" width="12"> Goodreads | [`src/api/goodreads.ts`](./src/api/goodreads.ts) | ⌛ |
| <img alt="" src="https://clockify.me/assets/images/brand-assets/clockify-icon.svg" width="12"> Clockify | [`src/api/clockify.ts`](./src/api/clockify.ts) | [View data](./data/clockify) | [Scroll to Docs ↓](#clockify) |
| <img alt="" src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" width="12"> Google Fit | [`src/api/google-fit.ts`](./src/api/google-fit.ts) | [View data](./data/health) | [Scroll to Docs ↓](#google-fit) |
| <img alt="" src="https://images.weserv.nl/?url=https://static1.ouraring.com/images/symbol-oura-large-white.svg&w=64&h=64&fit=cover&mask=circle" width="12"> Oura Ring | [`src/api/oura-ring.ts`](./src/api/oura-ring.ts) | [View data](./data/health) | [Scroll to Docs ↓](#oura-ring) |
<!-- prettier-ignore-end -->

## 🌱 Getting started

1. Create a repository [using this template](https://github.com/AnandChowdhary/life/generate)
2. Delete the [`./data`](./data) directory
3. Update the configuration in [`.liferc.yml`](./.liferc.yml)
4. Add the required GitHub repository secrets

## 🛠️ Configuration

A [`.liferc.yml`](./.liferc.yml) file is used to list the services required. You can add the camel-cased name of any of the supported services from below.

```yaml
daily:
  - goodreads
  - lastFm
  - rescueTime
  - pocketCasts
  - ouraRing
  - googleFit
```

All sensitive information required, such as API keys, are provided as environment variables. These are stored as GitHub repository secrets (see [Creating and storing encrypted secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)).

### <img alt="" src="https://cdn.worldvectorlogo.com/logos/spotify-2.svg" width="16"> Spotify

The Spotify API is used to track your music listening history and track library. Add the key `spotify` under `daily` to fetch this data every day.

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

### <img alt="" src="https://cdn2.iconfinder.com/data/icons/social-icon-3/512/social_style_3_lastfm-512.png" width="16"> Last.fm

The Last.fm API is used to track your music listening history. It is recommended over Spotify because you can scrobble tracks from multiple services. Add the key `lastFm` under `daily` to fetch this data every day.

You'll have to create an API account on https://www.last.fm/api/account/create. Since we don't require any tokens, you can add the default URL http://localhost:3000/callback under "Callback URL" in your Last.fm API account. When completed, you'll receive an API key and a shared secret.

| Environment variable   | Description   |
| ---------------------- | ------------- |
| `LASTFM_API_KEY`       | API key       |
| `LASTFM_SHARED_SECRET` | Shared secret |

### <img alt="" src="https://images.weserv.nl/?url=https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS5cnw0MQF7TnpSzlRTlIC6z4EHDEPP3B8qBw&usqp=CAU&w=64&h=64&fit=cover" width="16"> Rescue Time

The Rescue Time API is used to track your screen time from all your devices. Add the key `rescueTime` under `daily` to fetch this data every day.

You need to provide your Rescue Time API key, which is available on your [API key management](https://www.rescuetime.com/anapi/manage) page on the Rescue Time website.

To generate a new API key, scroll to "Create a new API key" and enter a description under "Reference label". Click on "Activate this key" and copy the API key.

| Environment variable | Description |
| -------------------- | ----------- |
| `RESCUETIME_API_KEY` | API key     |

### <img alt="" src="https://cdn.worldvectorlogo.com/logos/wakatime.svg" width="16"> Wakatime

The Wakatime API is used to track your programming time and top languages. Add the key `wakatime` under `daily` to fetch this data every day.

You need to provide your WakaTime API key, which is available on the [Settings](https://wakatime.com/settings/account) page on the WakaTime website. Under "API key", click on "[click to show]" to view the API key and copy it.

| Environment variable | Description |
| -------------------- | ----------- |
| `WAKATIME_API_KEY`   | API key     |

### <img alt="" src="https://images.weserv.nl/?url=https://lh3.googleusercontent.com/23K9TDTOdlo57Pi9JvNtPc9K-utruK6jQEpQGD_E4QBLRJYRAgLcC7gF2Rd_0T1qhLLS&w=64&h=64&fit=cover&mask=circle" width="16"> Pocket Casts

The Pocket Casts API is used to track your podcast listening history and track library. Add the key `pocketCasts` under `daily` to fetch this data every day.

⚠️ **Warning:** This service does not support API key or OAuth authentication and requires your password.

You need to provide your Pocket Casts email address and password to access your data. The npm package [pocketcasts](https://www.npmjs.com/package/pocketcasts) is used to fetch your library and listening history. The package, in turn, sends HTTP requests simulating a login to the web app and uses the generated token to access your data ([see source](https://github.com/coughlanio/pocketcasts/blob/master/src/index.js)).

| Environment variable    | Description |
| ----------------------- | ----------- |
| `POCKET_CASTS_USERNAME` | Username    |
| `POCKET_CASTS_PASSWORD` | Password    |

### <img alt="" src="https://images.weserv.nl/?url=https://icon-library.com/images/goodreads-icon/goodreads-icon-14.jpg&w=64&h=64&fit=cover&mask=circle" width="16"> Goodreads

The GoodReads API is used to track your reading history and list of books on your shelves. Add the key `goodreads` under `daily` to fetch this data every day.

You can find your API key and secret on the [API key](https://www.goodreads.com/api/keys) page on the Goodreads website.

| Environment variable | Description |
| -------------------- | ----------- |
| `GOODREADS_KEY`      | API key     |
| `GOODREADS_SECRET`   | API secret  |

### <img alt="" src="https://clockify.me/assets/images/brand-assets/clockify-icon.svg" width="16"> Clockify

The Clockify API is used to track your time sessions. Add the key `clockify` under `daily` to fetch this data every day.

You can generate your Clockify API on the User page: https://clockify.me/user/settings. Scroll to "API" and click on the "Generate" button. Then, copy your API key.

You also need your user ID and workspace ID. You can find your workspace ID by clicking on the "Settings" button in the navigation sidebar, and copying the ID from the address bar. For example, the URL https://clockify.me/workspaces/518ad43641f9dg74egfbbgaf/settings includes the workspace ID `518ad43641f9dg74egfbbgaf`.

To find your user ID, you can either go to the [User settings](https://clockify.me/user/settings) page and inspect the outgoing HTTP requests, or run the following command:

```bash
node -e 'require("./lib/api/clockify").getUserId()'
```

| Environment variable    | Description  |
| ----------------------- | ------------ |
| `CLOCKIFY_API_KEY`      | API key      |
| `CLOCKIFY_WORKSPACE_ID` | Workspace ID |
| `CLOCKIFY_USER_ID`      | User ID      |

### <img alt="" src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" width="16"> Google Fit

The Google Fit API is used to track your health and activity information. Add the key `googleFit` under `daily` to fetch this data every day.

To fetch your health data from Google Fit, you have to create a Google Cloud application. Head to https://console.cloud.google.com and create an application, then enable the Fitness API (https://console.cloud.google.com/apis/api/fitness.googleapis.com/overview).

After enabling the Fitness API, generate OAuth 2.0 credentials (see [Using OAuth 2.0 to Access Google APIs](https://developers.google.com/identity/protocols/oauth2)). Under "Authorized redirect URIs", enter https://developers.google.com/oauthplayground. You will generate a client ID and a client secret.

Then, head to the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) and click on the configuration icon on the top-right. Check the "Use your own OAuth credentials" checkbox and your client ID and client secret, then press "Close". Under "Select & authorize APIs", click on "Fitness API v1" and select all scopes. Click on the "Authorize APIs" button, then click on "Exchange authorization code for tokens". Finally, copy the generated access token and refresh token.

| Environment variable       | Description   |
| -------------------------- | ------------- |
| `GOOGLE_FIT_CLIENT_ID`     | Client ID     |
| `GOOGLE_FIT_CLIENT_SECRET` | Client secret |
| `GOOGLE_FIT_ACCESS_TOKEN`  | Access token  |
| `GOOGLE_FIT_REFRESH_TOKEN` | Refresh token |

### <img alt="" src="https://images.weserv.nl/?url=https://static1.ouraring.com/images/symbol-oura-large-white.svg&w=64&h=64&fit=cover&mask=circle" width="16"> Oura Ring

The Oura API is used to track your daily sleep and activity. Add the key `ouraRing` under `daily` to fetch this data every day.

The Oura API requires a Personal Access Token which can be generated on the [Personal Access Tokens](https://cloud.ouraring.com/personal-access-tokens) page on the Oura website. Click on the "Create A New Personal Access Token" button and enter a note for the token. Then, copy the generate token.

| Environment variable         | Description           |
| ---------------------------- | --------------------- |
| `OURA_PERSONAL_ACCESS_TOKEN` | Personal Access Token |

## 📄 License

- Icons from [The Noun Project](https://thenounproject.com): CC BY 3.0
  - Loader by [Rohith M S](https://thenounproject.com/rohithdezinr)
