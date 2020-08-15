declare module "goodreads-api-node" {
  export default function goodreads(
    params: {
      key: string;
      secret: string;
    },
    url: string
  ): {
    initOAuth(url: string): string;
  };
}
