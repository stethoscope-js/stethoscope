# 🧬 Life

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
