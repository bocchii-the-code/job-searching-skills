# 链接可达性核查手册

招聘链接会失效：岗位下线、域名换证书、ID 抄录错误、页面改成 SPA。本手册是「时效扫描」中核查链接的执行标准。

**总原则：没有真实打开过，不写「可用」；没有真实打开过，也不写「已失效」。先打开，再下结论。**

**能力降级阶梯（无插件环境同样可执行）：**

- **A 级（有浏览器自动化工具）**：完整核查，结论可写「可用 / 已失效」。工具不限：chrome-devtools MCP、agent-browser、Playwright、Selenium 等任一。
- **B 级（无浏览器，能发 HTTP / 跑脚本）**：官方接口直查 + 静态抓取；结论标注「未打开页面，仅接口 / 静态核验」。
- **C 级（两者都无）**：保持「待核实」，把链接清单交用户人工打开一遍。
- 等级不必写进文档，但结论的表述要与实际核查级别相称。

## 1. 逐条核查流程（A 级）

工具名以 chrome-devtools 风格为例；其他工具按等效功能替换（打开页面 / 执行页面 JS / 读取页面文本 / 查看网络请求）。

1. 静态 fetch 只做初筛：返回 200 只说明服务器应答——SPA 空壳、WAF 拦截（405/403）、跳转循环都会误报。
2. 浏览器打开与判定：
   - 打开动作用 try/catch 包住：导航超时（常见默认 10s）**不等于失败**，页面往往已在加载，继续下一步即可。
   - 等页面渲染：把等待写进「页面内执行 JS」的函数里（`await new Promise(r => setTimeout(r, 4000))`）——部分代码执行沙箱自身没有 setTimeout，页面函数里有。
   - 判定语义：正文含「职位不存在 / 已关闭 / 已下线」→ 失效；停留「正在加载中」数秒以上 → 加长等待重试一次；出现「申请职位 / 立即投递」＋ JD 正文 → 可用。
   - 页面句柄报 `No page found` = 浏览器会话被关过，重新开页即可。
3. **「页面正文未渲染」必须用浏览器复核后才能写**：实测飞书招聘页静态抓取只显示站点导航，真实浏览器完整渲染 JD（2026-10 实例）。此类旧结论按浏览器结果修正。
4. 处理规则：打不开 → 工作手册删除或移入档案「已关闭」一行；链接与岗位名对不上（旧链接被换成别的岗位）→ 换新链接并注明；日期用绝对日期。

## 2. 官方接口直查（一手核验，优先于页面）

两种执行方式任选：**浏览器内同源 fetch**（先打开目标域名任一页面，再 fetch 相对路径）最稳、可绕过 WAF；**curl / 脚本直接请求**也可以，被 WAF 拦时退回浏览器方式或按 B 级标注。

| 平台 | 接口与要点 | 状态 |
|---|---|---|
| 北森 hotjob（wecruit.hotjob.cn；易方达/南方/博时/华泰等） | 详情：`POST /wecruit/positionInfo/listPositionDetail/{tenant}?iSaJAx=isAjax`，body `postId=<id>&recruitType=`；列表：`POST /wecruit/positionInfo/listPosition/{tenant}`，body `isFrompb=true&recruitType=1\|2\|3&pageSize=200&currentPage=1`（1 校招 / 2 社招 / 3 实习），数据在 `data.pageForm.pageData[]` | 已实测（2026-10） |
| 腾讯 join.qq.com | 详情：`GET /api/v1/jobDetails/getJobDetailsByPostId?postId=`；列表：`POST /api/v1/position/searchPosition`（照抄页面发出的请求体，可验证岗位是否仍在在招池） | 已实测（2026-10） |
| 智谱 / MiniMax / Pony.ai 飞书招聘 | `POST https://<租户>.jobs.feishu.cn/api/v1/search/job/posts`——需先取 CSRF token（`POST /api/v1/csrf/token/` 并携带其 set-cookie），请求头加 `x-csrf-token`、`X-Requested-With`、`website-path` | 调研记录（页面已浏览器确证；接口参数使用前先跑一条验证） |
| Moka（app.mokahr.com；Moonshot/StepFun/Galbot/DeepSeek） | `POST /api/outer/ats-apply/website/jobs/v2`，body `{orgId, siteId, limit, offset}`：limit>20 返回空；响应 AES-128-CBC 加密（key `necromancer`，iv `de7c21ed8d6f50fe`）。页面 `#/job/<uuid>` 哈希路由浏览器直接打开即可 | 调研记录（同上） |
| 通用 | 查看浏览器的网络请求记录（chrome-devtools 为 `get_network_request` 一类工具）——先让页面自己跑一遍，照抄它的请求最稳 | 已实测 |

hotjob 关键语义：详情接口 `state:1017` = 「该职位招聘已经关闭」；`showDeliverButton:1` = 仍可投递；`endDate` 为系统截止（优先于二手指称）。

## 3. 常见陷阱（实测）

- **ID 抄录错误**：hotjob postId 约 24 位 hex，多一位/少一位接口一查即穿（南方基金 FDE 实例：文档多抄一个「9」，接口报"已关闭"，实为 ID 错——先怀疑 ID，再相信"关闭"）。
- **域名/证书失效**：job.htsc.com.cn 证书无效（浏览器直接拦截）→ 查官方公告找新入口（华泰改用 hotjob 系统）。
- **死域名**：lingyiwanwu.com/careers.html（已改飞书招聘）、sensetime.com/cn/join-us（已改 hr-jobs.sensetime.com/edu）；modelbest.cn 须带 `www.`。
- **跳转循环**：Moka 对脚本 fetch 会重定向循环，浏览器打开正常——不要据此判死。
- **PC/移动差异**：部分门户（如同花顺）PC 列表页在部分环境不渲染，移动端列表页可用——替换前两边各开一次。
- **「今日截止」**：写入行动区带绝对日期；过期即移到档案的已截止表。

## 4. 批量校验脚本（整理/重组文档时用）

用任意代码执行环境跑脚本（Node / Python / …）；装了 context-mode 等沙箱工具可用它们，好处是大文本不进上下文。

- **URL 清单对比**：提取整理前后两个文件的全部 URL（排除 md 链接包裹与反引号代码段、按中文/全角字符截断），输出「旧有新无」清单，逐条判因：变体差异 / 已关闭 / 来源压缩 / 真丢失。
- **表格完整性**：统计每行 `|` 数量分布，偏离众数的行即格式破损。
- **裸链接转可点击**：`https://…` 纯文本批量转 `[url](url)`（跳过 md 链接内、代码段、模板占位符如 `<id>`；全角标点处截断；尾部 ASCII 标点按括号配平修剪）。
- 流程：改动前刷新 `.bak` 备份 → 改动 → 跑一遍清单对比与空链检查收尾。
