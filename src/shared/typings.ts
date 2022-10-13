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
  size: number;
  alias: string;
  name: string;
  url: string;
  create_time: number;
  hash: string;
  extra?: string;
};

export type PageResp = {
  total: number;
  list: StoreItem[];
};
