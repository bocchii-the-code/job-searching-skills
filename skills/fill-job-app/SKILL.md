---
name: fill-job-app
description: >-
  求职申请表单的通用填写与投递流程（任意公司的在线申请/网申系统）：申请勘察、
  在线档案创建、表单批量补填、保存校验迭代、提交前确认；简历数据来源支持各种格式（YAML / PDF / Markdown / DOCX 等）。
  Use when the user asks to "帮我填写申请" / 网申 / 投递 / fill a job application,
  or needs to complete an application form for any company — including platforms
  like 北森 eRecruit（hotjob.cn / zhiye.com，华泰/易方达/南方基金/中金等）、Workday、
  官网自建招聘页（HSBC/微软/Jane Street 等）、飞书招聘、Moka。不适用于非求职表格
  （签证/报销/问卷）。
---

# 求职申请填写（fill-job-app）

通用流程 + 平台手册。数据始终来自用户的简历仓库；敏感信息尊重用户边界。

## 数据来源与前置

- 简历数据源：用户简历仓库里的 CV 文件，格式不限（rendercv YAML、PDF、Markdown、
  DOCX 等）。开工前先列出候选文件并确认用哪份（多份时以最新、与岗位最匹配的为准）；
  PDF/Office 文档可用文档转换类技能（pdf / convert-documents-to-markdown / docx）
  读取出内容
- 平台要求上传 PDF 时：有 rendercv YAML 就渲染最新版（Windows 设
  `PYTHONIOENCODING=utf-8`，输出到临时目录，避免覆盖仓库产物）；已有现成 PDF 直接
  用；其他格式先用文档转换技能转换
- **先读 CV 数据再动表单**，避免中途来回找数据
- **不猜**：证件号、出生日期、家庭关系、照片等只从用户处获取（或用户自填）

## 通用流程（平台无关）

1. **勘察**：打开申请页，梳理字段清单、必填项、账号/认证要求、附件入口
2. **登录**：首选让用户本人完成（短信/扫码/SSO）——`select_page(bringToFront)`
   后交给用户，等用户确认；不代持账号密码
3. **建档**：若平台要求先建「在线简历/账号档案」：优先找「上传简历解析」入口，
   用最新 PDF 预填，再逐块审计修正（自动解析必有错位：实测出现过项目名混入
   「•」符号、实习被放进「工作经历」、条目内容错位）
4. **补填**：用页面内辅助脚本填（见「辅助脚本」）；先小步验证再批量操作
5. **文字字段用真实键盘**：`evaluate(el.focus())` → `press_key("Control+A")` →
   `type_text(值)`。脚本合成设值在 Vue/React 受控组件上常不触发校验模型，
   保存时会报「请填写」——本技能最重要的一条 ★
6. **保存/校验迭代**：保存后读错误提示逐项修复；校验常按区块短路，需多轮迭代
7. **敏感项留给用户**：证件号码、家庭信息、照片、签名；用户明确委托才代填
8. **提交/投递前与用户确认**（对用户有外部影响的动作）
9. 完成后**清理临时文件**；把新平台的验证经验**沉淀回本技能**

## 通用技术要点

- 招聘页多为 SPA：普通 HTTP 抓取只能拿到空壳，用 chrome-devtools MCP 真实浏览器
- 关键按钮（登录、开新窗口/新标签）用 MCP 真实点击（uid）；页面脚本的合成
  `click()` 可能被忽略。下拉/单选/日期用合成 mousedown/click 通常有效
- 大量读取：`take_snapshot` 落盘到**项目目录内**再解析（ctx 沙箱只能读项目内
  文件），不要把原始表单灌进上下文
- 日期控件是 readonly 输入框时：点开面板，往面板的输入框输值 + Enter
- 新条目/动态区块会导致控件索引偏移：按「条目容器」作用域定位，不要用全局索引
- 上传前确认文件路径在浏览器所在机器可访问；上传后轮询输入框 value 确认解析完成
- 申请页可能有多个相似按钮（如职位页多张卡片各带「立即投递」）：用 URL 参数
  （postId 等）与页面结构对应起来再点

## 平台手册

### 北森 eRecruit（hotjob.cn / zhiye.com）——已验证

（华泰、易方达、南方基金、博时、中信建投、中金、银河、讯飞、泰康、汇添富等）

- 职位页 `posDetail.html`；登录点「登录/注册」→ 微信扫码（交给用户）
- 「立即投递」无简历时跳 `account.html#/resumeManage` → 「新建简历」开新标签
  `resumeOperation.html`（用 `list_pages` 找新页）
- 表单是 Ant Design Vue v1；用 `scripts/antd-vue-helpers.js`（元素作用域版本）
- 字段速查：下拉 `.ant-select`（显示值 `.ant-select-selection`，选项
  `.ant-select-dropdown-menu-item`）；可搜索下拉向搜索 input 输关键词后选择；
  日期 `input.ant-calendar-picker-input` + 面板 `input.ant-calendar-input`；
  错误 `.ant-form-item-explain`；清除已选 `.ant-select-selection__clear` /
  `.ant-calendar-picker-clear`；章节锚点
  `getElementById('11'/'14'/'123'/'19'/'40'/'18')`（版本可能变化，用前验证）
- 平台特性：教育「从高中填起」、海外经历城市为两级（其他国家/地区 + 国家）；
  「工作经历」栏禁写实习（解析经常放错，需搬迁到「实习经历」）；计算机技能约
  18 行空行，填 5-8 条核心即可；描述字段支持多行文本
- 同一门户多岗位共用一份在线简历；建好后逐岗点「立即投递」

### 其他平台——待验证，按通用流程处理

Workday（HKEX 等）、官网自建（HSBC / 微软 / Jane Street）、飞书招聘、Moka、牛客等。
现场勘察 DOM 结构，套用「通用技术要点」；验证成功后把要点追加到本小节。

## 敏感信息边界

- 默认留给用户本人操作：证件号码、家庭关系、证件照、签名；用户明确委托才代填
- 提交/投递等最终动作先与用户确认
- 本技能与脚本不包含任何个人数据；CV 数据从用户的简历仓库读取

## 辅助脚本

- `scripts/antd-vue-helpers.js`：Ant Design Vue 页面辅助函数（北森用）。全文作为
  `evaluate_script` 的 function 参数注入；页面导航后需重新注入。函数清单：
  `_pickEl / _readOptionsEl / _openEl`（元素作用域，推荐）、
  `_pick / _readOptions / _open / _sel`（全局索引版，条目增删后会偏移，慎用）、
  `_searchPick`（可搜索下拉）、`_setVal / _fill`（应急设值，需真实键盘复核）、
  `_setDateEl / _clearDateEl`、`_radio`、`_cells`（按文本定位条目容器）
- 其他技术栈的平台：验证后可在 `scripts/` 下新增对应辅助脚本
