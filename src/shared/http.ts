export type PageQuery = {
  pageNumber: number;
  pageSize: number;
  kw?: string;
  md5?: string;
  startTime?: number;
  endTime?: number;
};
export type StoreItem = {
  name: string;
  url: string;
  createTime: number;
  md5: string;
};

export type PageResp = {
  total: number;
  list: StoreItem[];
};