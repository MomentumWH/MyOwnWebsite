import CSQaQAPI from "./CSQAQAPI";

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
export const getKline = (data?: any) => {
  return CSQaQAPI.get("/api/v1/sub/kline", {
    params: data || {},
  });
};

//获取指数详情数据
export const getSubData = (data?: any) => {
  return CSQaQAPI.get("/api/v1/sub_data", {
    params: data || {},
  });
};

//实时成交量数据

//获取成交量数据信息
export const getVolDataInfo = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/vol_data_info", data);
};

//获取成交量图表/磨损信息
export const getVolDataDetail = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/vol_data_detail", data);
};

//武器箱数据

//获取武器箱开箱数量统计
export const getCase = (data?: any) => {
  return CSQaQAPI.get("/api/v1/stat/case", {
    params: data || {},
  });
};

//获取武器箱开箱回报率列表
export const getRoi = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/roi", data);
};

//获取单个武器箱开箱回报率走势
export const getRoiDetail = (data?: any) => {
  return CSQaQAPI.get("/api/v1/info/roi_detail", {
    params: data || {},
  });
};

//获取单个武器箱历史开箱量
export const getChart = (data?: any) => {
  return CSQaQAPI.post("/api/v1/stat/case/chart", data);
};

//获取所有收藏品列表
export const getContainerDataInfo = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/container_data_info", data);
};

//获取单个收藏品的包含物
export const getContainerDetail = (data?: any) => {
  return CSQaQAPI.get("/api/v1/info/good/container_detail", {
    params: data || {},
  });
};

//库存监控
//获取库存监控最新动态
export const getTaskTrends = (data?: any) => {
  return CSQaQAPI.post("/api/v1/monitor/get_task_trends", data);
};

//获取库存监控任务列表
export const getTaskList = (data?: any) => {
  return CSQaQAPI.post("/api/v1/monitor/get_task_list", data);
};

//获取库存监控持有量排行榜
export const getRank = (data?: any) => {
  return CSQaQAPI.post("/api/v1/monitor/rank", data);
};

//获取监控单个用户信息
export const getTaskInfo = (data?: any) => {
  return CSQaQAPI.post("/api/v1/task/get_task_info", data);
};

//获取监控单个用户库存动态
export const getTaskBusiness = (data?: any) => {
  return CSQaQAPI.post("/api/v1/task/get_task_business", data);
};

//获取监控单个用户全部库存
export const getTaskAll = (data?: any) => {
  return CSQaQAPI.post("/api/v1/task/get_task_all", data);
};

//获取监控单个用户库存快照列表
export const getTaskRecent = (data?: any) => {
  return CSQaQAPI.post("/api/v1/task/get_task_recent", data);
};

//饰品详情

//获取饰品的ID信息
export const getGoodId = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/get_good_id", data);
};

//联想查询饰品的ID信息
export const suggest = (data?: any) => {
  return CSQaQAPI.get("/api/v1/search/suggest", {
    params: data || {},
  });
};

//获取单件饰品详情
export const good = (data?: any) => {
  return CSQaQAPI.get("/api/v1/info/good", {
    params: data || {},
  });
};

//获取单件饰品存世量走势
export const statistic = (data?: any) => {
  return CSQaQAPI.get("/api/v1/info/good/statistic", {
    params: data || {},
  });
};

//批量获取饰品出售价格数据
export const getPriceByMarketHashName = (data?: any) => {
  return CSQaQAPI.post("/api/v1/goods/getPriceByMarketHashName", data);
};

//获取单件饰品图表数据

export const getOneChart = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/chart", data);
};

//涨跌/热门排行

//获取排行榜单信息接口
export const getRankList = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/get_rank_list", data);
};

//获取饰品列表信息
export const getPageList = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/get_page_list", data);
};

//获取热门系列饰品列表
export const getSeriesList = (data?: any) => {
  return CSQaQAPI.post("/api/v1/info/get_series_list", data);
};

//获取单件热门系列饰品详情
export const getSeriesDetail = (data?: any) => {
  return CSQaQAPI.get("/api/v1/info/get_series_detail", {
    params: data || {},
  });
};
