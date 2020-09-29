# <a href="https://stethoscope.js.org"><img alt="Stethoscope" src="https://stethoscope.js.org/branding/screenshot.jpeg"></a>

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
| Service | API | Sample data | Docs |
| ------- | --- | ----------- | ---- |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/spotify-2.svg" width="12"> Spotify | [`src/api/spotify.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/spotify.ts) | [View data](./data/spotify-music) | [View docs →](https://stethoscope.js.org/docs/integrations/spotify) |
| <img alt="" src="https://cdn2.iconfinder.com/data/icons/social-icon-3/512/social_style_3_lastfm-512.png" width="12"> Last.fm | [`src/api/last-fm.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/last-fm.ts) | [View data](./data/last-fm-music) | [View docs →](https://stethoscope.js.org/docs/integrations/lastfm) |
| <img alt="" src="https://images.weserv.nl/?url=https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS5cnw0MQF7TnpSzlRTlIC6z4EHDEPP3B8qBw&usqp=CAU&w=64&h=64&fit=cover" width="12"> Rescue Time | [`src/api/rescuetime.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/rescuetime.ts) | [View data](./data/rescuetime-time-tracking) | [View docs →](https://stethoscope.js.org/docs/integrations/rescuetime) |
| <img alt="" src="https://cdn.worldvectorlogo.com/logos/wakatime.svg" width="12"> Wakatime | [`src/api/wakatime.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/wakatime.ts) | [View data](./data/wakatime-time-tracking) | [View docs →](https://stethoscope.js.org/docs/integrations/wakatime) |
| <img alt="" src="https://images.weserv.nl/?url=https://lh3.googleusercontent.com/23K9TDTOdlo57Pi9JvNtPc9K-utruK6jQEpQGD_E4QBLRJYRAgLcC7gF2Rd_0T1qhLLS&w=64&h=64&fit=cover&mask=circle" width="12"> Pocket Casts | [`src/api/pocket-casts.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/pocket-casts.ts) | [View data](./data/pocket-casts-podcasts) | [View docs →](https://stethoscope.js.org/docs/integrations/pocket-casts) |
| <img alt="" src="https://images.weserv.nl/?url=https://icon-library.com/images/goodreads-icon/goodreads-icon-14.jpg&w=64&h=64&fit=cover&mask=circle" width="12"> Goodreads | [`src/api/goodreads.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/goodreads.ts) | [View data](./goodreads-books) | [View docs →](https://stethoscope.js.org/docs/integrations/goodreads) |
| <img alt="" src="https://clockify.me/assets/images/brand-assets/clockify-icon.svg" width="12"> Clockify | [`src/api/clockify.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/clockify.ts) | [View data](./data/clockify-time-tracking) | [View docs →](https://stethoscope.js.org/docs/integrations/clockify) |
| <img alt="" src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" width="12"> Google Fit | [`src/api/google-fit.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/google-fit.ts) | [View data](./data) | [View docs →](https://stethoscope.js.org/docs/integrations/google-fit) |
| <img alt="" src="https://images.weserv.nl/?url=https://static1.ouraring.com/images/symbol-oura-large-white.svg&w=64&h=64&fit=cover&mask=circle" width="12"> Oura Ring | [`src/api/oura-ring.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/oura-ring.ts) | [View data](./data/oura-activity) | [View docs →](https://stethoscope.js.org/docs/integrations/oura-ring) |
| <img alt="" src="https://upload.wikimedia.org/wikipedia/en/9/9f/Twitter_bird_logo_2012.svg" width="12"> Twitter | [`src/api/twitter.ts`](https://github.com/stethoscope-js/integrations/tree/master/src/api/twitter.ts) | [View data](./data/twitter-tweets) | [View docs →](https://stethoscope.js.org/docs/integrations/twitter) |
<!-- prettier-ignore-end -->

## 🌱 [Getting started](https://stethoscope.js.org/docs/)

1. Create a repository [using this template](https://github.com/stethoscope-js/stethoscope/generate)
2. Delete the [`./data`](./data) directory
3. Update the configuration in [`.stethoscoperc.yml`](./.stethoscoperc.yml)
4. Add the required GitHub repository secrets
5. [Enable publishing](https://docs.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) the `master` branch

## 📝 Documentation

**Visit our docs website: https://stethoscope.js.org**

## 🛠️ Configuration

A [`.stethoscoperc.yml`](./.stethoscoperc.yml) file is used for configuration. For more information, see https://stethoscope.js.org/docs/configuration.

## 📊 Example

This is a real-time screenshot of [Anand Chowdhary](https://anandchowdhary.com)'s RescueTime weekly overview URL, fetched from [AnandChowdhary/life](https://github.com/AnandChowdhary/life):

[![Screenshot of visualization](https://api.microlink.io/?url=https%3A%2F%2Fstethoscope.js.org%2Fembed%2F%3Frepo%3DAnandChowdhary%252Flife%26api%3Drescuetime-time-tracking%26latest%3Dtop-overview.weeks&waitFor=5000&waitUntil=networkidle2&screenshot=true&meta=false&embed=screenshot.url&device=ipadlandscape)](https://stethoscope.js.org/embed/?repo=AnandChowdhary%2Flife&api=rescuetime-time-tracking&latest=top-overview.weeks)

Learn how to make your own embeds on https://stethoscope.js.org/docs/embed.

## 📄 License

- Code: [MIT](./LICENSE) © [Anand Chowdhary](https://anandchowdhary.com)
- Data in [`./data`](./data): [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/) © [Anand Chowdhary](https://anandchowdhary.com)
