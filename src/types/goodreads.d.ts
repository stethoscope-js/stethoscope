declare module "goodreads-api-node" {
  export default function goodreads(
    params: {
      key: string;
      secret: string;
    },
    url: string
  ): {
    initOAuth(url: string): void;
    getRequestToken(): Promise<string>;
    getBooksOnUserShelf(
      userId: string,
      shiefName: string
    ): Promise<{
      //
    }>;
    getUserInfo(
      id: string
    ): Promise<{
      user_shelves: {
        type: "array";
        user_shelf: {
          id: { _: string; type: "integer" };
          name: string;
          book_count: { _: string; type: "integer" };
          exclusive_flag: { _: string; type: "boolean" };
          sort: { nil: "true" };
          order: "a";
          per_page: { type: "integer"; nil: "true" };
          featured: { _: string; type: "boolean" };
          recommend_for: { _: string; type: "boolean" };
          sticky: { type: "boolean"; nil: "true" };
        }[];
      };
    }>;
  };
}
