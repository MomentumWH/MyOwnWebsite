import CSQaQAPI from "./CSQAQAPI";

export type CsqaqParams = Record<string, unknown>;

//绑定本机白名单IP
export const bindLocalIp = () => {
  return CSQaQAPI.post("/api/v1/sys/bind_local_ip");
};

//饰品指数

//获取首页相关数据
export const getCurrentData = (type: string) => {
  return CSQaQAPI.get("/api/v1/current_data", {
    params: { type },
  });
};

//获取指数K线图
export const getKline = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/sub/kline", {
    params: data || {},
  });
};

//获取指数详情数据
export const getSubData = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/sub_data", {
    params: data || {},
  });
};

//实时成交量数据

//获取成交量数据信息
export const getVolDataInfo = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/info/vol_data_info", data);
};

//获取成交量图表/磨损信息
export const getVolDataDetail = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/info/vol_data_detail", data);
};

//武器箱数据

//获取武器箱开箱数量统计
export const getCase = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/stat/case", {
    params: data || {},
  });
};

//获取武器箱开箱回报率列表
export const getRoi = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/info/roi", data);
};

//获取单个武器箱开箱回报率走势
export const getRoiDetail = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/info/roi_detail", {
    params: data || {},
  });
};

//获取单个武器箱历史开箱量
export const getChart = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/stat/case/chart", data);
};

//获取所有收藏品列表
export const getContainerDataInfo = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/info/container_data_info", data);
};

//获取单个收藏品的包含物
export const getContainerDetail = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/info/good/container_detail", {
    params: data || {},
  });
};

//库存监控
//获取库存监控最新动态
export const getTaskTrends = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/monitor/get_task_trends", data);
};

//获取库存监控任务列表
export const getTaskList = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/monitor/get_task_list", data);
};

//获取库存监控持有量排行榜
export const getRank = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/monitor/rank", data);
};

//获取监控单个用户信息
export const getTaskInfo = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/task/get_task_info", data);
};

//获取监控单个用户库存动态
export const getTaskBusiness = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/task/get_task_business", data);
};

//获取监控单个用户全部库存
export const getTaskAll = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/task/get_task_all", data);
};

//获取监控单个用户库存快照列表
export const getTaskRecent = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/task/get_task_recent", data);
};

//饰品详情

//获取饰品的ID信息
export const getGoodId = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/info/get_good_id", data);
};

//联想查询饰品的ID信息
export const suggest = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/search/suggest", {
    params: data || {},
  });
};

//获取单件饰品详情
export const good = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/info/good", {
    params: data || {},
  });
};

//获取单件饰品存世量走势
export const statistic = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/info/good/statistic", {
    params: data || {},
  });
};

//批量获取饰品出售价格数据
export const getPriceByMarketHashName = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/goods/getPriceByMarketHashName", data);
};

//获取单件饰品图表数据

export const getOneChart = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/info/chart", data);
};

//涨跌/热门排行

export interface RankListFilter {
  排序: [string] | string[];
  类型?: string[];
  品质?: string[];
  类别?: string[];
  磨损?: string[];
  价格最低价?: number;
  价格最高价?: number;
  短租最低价?: number;
  短租最高价?: number;
  长租最低价?: number;
  长租最高价?: number;
  短租收益最低?: number;
  短租收益最高?: number;
  长租收益最低?: number;
  长租收益最高?: number;
  在售最少?: number;
  在售最多?: number;
  出租最少?: number;
  出租最多?: number;
  求购最少?: number;
  求购最多?: number;
  [key: string]: string[] | number | undefined;
}

export interface RankListParams {
  page_index: number;
  page_size: number;
  show_recently_price?: boolean;
  filter: RankListFilter;
}

//获取排行榜单信息接口
export const getRankList = (data: RankListParams) => {
  return CSQaQAPI.post("/api/v1/info/get_rank_list", data);
};

//获取排行榜单信息接口（文档示例默认参数）
export const getRankListByDefaultSort = (
  data?: Partial<RankListParams>,
) => {
  return getRankList({
    page_index: 1,
    page_size: 15,
    show_recently_price: false,
    ...data,
    filter: {
      排序: ["价格_售价减求购价(百分比)_升序(BUFF)"],
      ...data?.filter,
    },
  });
};

//获取饰品列表信息
export const getPageList = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/info/get_page_list", data);
};

//获取热门系列饰品列表
export const getSeriesList = (data?: CsqaqParams) => {
  return CSQaQAPI.post("/api/v1/info/get_series_list", data);
};

//获取单件热门系列饰品详情
export const getSeriesDetail = (data?: CsqaqParams) => {
  return CSQaQAPI.get("/api/v1/info/get_series_detail", {
    params: data || {},
  });
};
