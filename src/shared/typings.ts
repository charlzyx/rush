export type PageQuery = {
  scope: string;
  alias: string;
  pageNumber: number;
  pageSize: number;
  kw?: string;
  startTime?: number;
  endTime?: number;
};

export type StoreItem = {
  id?: string;
  scope: string;
  alias: string;
  dir: string;
  name: string;
  size: number;
  url: string;
  create_time: number;
  hash: string;
  extra?: string;
};

export type StatisticsItem = {
  id?: string;
  name: string;
  before: number;
  after: number;
  create_time: number;
};

export type PageResp = {
  total: number;
  list: StoreItem[];
};
