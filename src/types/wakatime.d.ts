declare module "wakatime-client" {
  export const RANGE: {
    LAST_7_DAYS: "LAST_7_DAYS";
    LAST_30_DAYS: "LAST_30_DAYS";
    LAST_6_MONTHS: "LAST_6_MONTHS";
    LAST_YEAR: "LAST_YEAR";
  };
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
    getMyStats(params: {
      range: string;
    }): Promise<{
      data: any;
    }>;
  }
}
