export type PageQuery = {
  pageNumber: number;
  pageSize: number;
  kw?: string;
  startTime?: number;
  endTime?: number;
};
export type StoreItem = {
  name: string;
  url: string;
  create_time: number;
};

export type PageResp = {
  total: number;
  list: StoreItem[];
};
