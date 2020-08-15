declare module "wakatime-client" {
  export class WakaTimeClient {
    constructor(apiKey: string);
    getMySummary(params: {
      dateRange: { startDate: string; endDate: string };
    }): Promise<{
      start: string;
      end: string;
      data: {
        categories: any[];
        dependencies: [];
        editors: any[];
        grand_total: any;
        languages: any[];
        machines: any[];
        operating_systems: any[];
        projects: any[];
        range: any;
      }[];
    }>;
  }
}
