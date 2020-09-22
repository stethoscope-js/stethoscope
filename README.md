# 🩺 Stethoscope

[![Stethoscope CI](https://github.com/stethoscope-js/stethoscope/workflows/Stethoscope%20CI/badge.svg)](https://github.com/stethoscope-js/stethoscope/actions?query=workflow%3A%22Stethoscope+CI%22)
[![Update Template CI](https://github.com/stethoscope-js/stethoscope/workflows/Update%20Template%20CI/badge.svg)](https://github.com/stethoscope-js/stethoscope/actions?query=workflow%3A%22Update+Template+CI%22)

Track, visualize, and embed all your health and life data — location, health, work, play, and more.

[**To get started, visit stethoscope.js.org →**](https://stethoscope.js.org)

## 🌟 Features

- Track data from anywhere (health, music, time tracking, etc.)
- Generate easy-to-consume API endpoints for your data
- Daily, weekly, monthly, and yearly graphs with easy embedding

### Supported services

<!-- prettier-ignore-start -->
| Service | API | Example data | Docs |
| ------- | --- | ------------ | ---- |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/spotify-2.svg" width="12"> Spotify | [`src/api/spotify.ts`](./src/api/spotify.ts) | [View data](./data/music) | [View docs →](https://stethoscope.js.org/docs/integrations/spotify) |
| <img alt="" src="https://cdn2.iconfinder.com/data/icons/social-icon-3/512/social_style_3_lastfm-512.png" width="12"> Last.fm | [`src/api/last-fm.ts`](./src/api/last-fm.ts) | [View data](./data/music) | [View docs →](https://stethoscope.js.org/docs/integrations/lastfm) |
| <img alt="" src="https://images.weserv.nl/?url=https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS5cnw0MQF7TnpSzlRTlIC6z4EHDEPP3B8qBw&usqp=CAU&w=64&h=64&fit=cover" width="12"> Rescue Time | [`src/api/rescuetime.ts`](./src/api/rescuetime.ts) | [View data](./data/rescuetime) | [View docs →](https://stethoscope.js.org/docs/integrations/rescuetime) |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/wakatime.svg" width="12"> Wakatime | [`src/api/wakatime.ts`](./src/api/wakatime.ts) | [View data](./data/wakatime) | [View docs →](https://stethoscope.js.org/docs/integrations/wakatime) |
| <img alt="" src="https://images.weserv.nl/?url=https://lh3.googleusercontent.com/23K9TDTOdlo57Pi9JvNtPc9K-utruK6jQEpQGD_E4QBLRJYRAgLcC7gF2Rd_0T1qhLLS&w=64&h=64&fit=cover&mask=circle" width="12"> Pocket Casts | [`src/api/pocket-casts.ts`](./src/api/pocket-casts.ts) | [View data](./data/podcasts) | [View docs →](https://stethoscope.js.org/docs/integrations/pocket-casts) |
| <img alt="" src="https://images.weserv.nl/?url=https://icon-library.com/images/goodreads-icon/goodreads-icon-14.jpg&w=64&h=64&fit=cover&mask=circle" width="12"> Goodreads | [`src/api/goodreads.ts`](./src/api/goodreads.ts) | ⌛ |
| <img alt="" src="https://clockify.me/assets/images/brand-assets/clockify-icon.svg" width="12"> Clockify | [`src/api/clockify.ts`](./src/api/clockify.ts) | [View data](./data/clockify) | [View docs →](https://stethoscope.js.org/docs/integrations/clockify) |
| <img alt="" src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" width="12"> Google Fit | [`src/api/google-fit.ts`](./src/api/google-fit.ts) | [View data](./data/health) | [View docs →](https://stethoscope.js.org/docs/integrations/google-fit) |
| <img alt="" src="https://images.weserv.nl/?url=https://static1.ouraring.com/images/symbol-oura-large-white.svg&w=64&h=64&fit=cover&mask=circle" width="12"> Oura Ring | [`src/api/oura-ring.ts`](./src/api/oura-ring.ts) | [View data](./data/health) | [View docs →](https://stethoscope.js.org/docs/integrations/oura-ring) |
<!-- prettier-ignore-end -->

## 🌱 Getting started

1. Create a repository [using this template](https://github.com/stethoscope-js/stethoscope/generate)
2. Delete the [`./data`](./data) directory
3. Update the configuration in [`.stethoscoperc.yml`](./.stethoscoperc.yml)
4. Add the required GitHub repository secrets
5. [Enable publishing](https://docs.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) the `gh-pages` branch

## 📝 Documentation

**Visit our docs website: https://stethoscope.js.org**

## 🛠️ Configuration

A [`.stethoscoperc.yml`](./.stethoscoperc.yml) file is used for configuration. For more information, see https://stethoscope.js.org/docs/configuration.

## 📊 Example

This is a real-time screenshot of [Anand Chowdhary](https://anandchowdhary.com)'s RescueTime weekly overview URL, fetched from [AnandChowdhary/life](https://github.com/AnandChowdhary/life):

[![Screenshot of visualization](https://api.microlink.io/?url=https%3A%2F%2Fanandchowdhary.github.io%2Flife%2F%3Frepo%3DAnandChowdhary%252Flife%26api%3Drescuetime-time-tracking%26latest%3Dtop-overview.weeks&waitFor=5000&waitUntil=networkidle2&screenshot=true&meta=false&embed=screenshot.url&device=ipadlandscape)](https://anandchowdhary.github.io/life/?repo=AnandChowdhary%2Flife&api=rescuetime-time-tracking&latest=top-overview.weeks)

Learn how to make your own embeds on https://stethoscope.js.org/docs/embed.

## 📄 License

- Code: [MIT](./LICENSE) © [Anand Chowdhary](https://anandchowdhary.com)
- Data in [`./data`](./data): [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/) © [Anand Chowdhary](https://anandchowdhary.com)
- Icons in [`./src/app`](./src/app)
  - Loader: [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) © [Rohith M S](https://thenounproject.com/rohithdezinr)
  - Error: [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) © [Roselin Christina](https://thenounproject.com/rosttarose)
