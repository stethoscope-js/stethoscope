interface Podcast {
  uuid: string;
  title: string;
  author: string;
  description: string;
  url: string;
}

interface MyPodcast extends Podcast {
  episodesSortOrder: number;
  autoStartFrom: number;
  lastEpisodePublished: string;
  unplayed: boolean;
  lastEpisodeUuid: string;
  lastEpisodePlayingStatus: number;
  lastEpisodeArchived: boolean;
}

interface Episode {
  uuid: string;
  url: string;
  published: string;
  duration: number;
  fileType: string;
  title: string;
  size: string;
  playingStatus: number;
  playedUpTo: number;
  starred: boolean;
  podcastUuid: string;
  podcastTitle: string;
  episodeType: string;
  episodeSeason: string;
  episodeNumber: string;
  isDeleted: boolean;
}

interface EpisodeList {
  total: number;
  episodes: Episode[];
}

declare module "pocketcasts" {
  export default class PocketCasts {
    constructor(email: string, password: string);
    private post<T>(path: string, json: any): Promise<T>;
    private get<T>(path: string): Promise<T>;

    login(): Promise<void>;

    getList(): Promise<{ podcasts: MyPodcast[] }>;
    getNewReleases(): Promise<EpisodeList>;
    getInProgress(): Promise<EpisodeList>;
    getStarred(): Promise<EpisodeList>;
    getHistory(): Promise<EpisodeList>;
    getStats(): Promise<any>;
    getSearchResults({
      term,
    }: {
      term: string;
    }): Promise<{ podcasts: Podcast[] }>;
    getRecommendedEpisodes(): Promise<EpisodeList>;
    getCategories(): Promise<any>; // 404
    getContent(): Promise<any>; // 404
    getFeatured(): Promise<any>; // 404
    getNetworkList(): Promise<any>; // 404
    getPopular(): Promise<any>; // 404
    getTrending(): Promise<any>; // 404
  }
}
