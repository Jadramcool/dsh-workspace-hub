# 🗂️ dsh-workspace-hub — 工作区中枢

> **DSH 工作区的一站式组织与洞察面板** — 分组归类、拖拽排序、内联编辑，配上 Token 与花费统计，让每个工作区都一目了然。

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24.0.0-339933)
![Platform](https://img.shields.io/badge/platform-DSH%20Web-6ea8ff)

---

## ✨ 功能亮点

### 🗂️ 分组管理

- **三层拖拽排序** — 分组卡片、工作区行、会话行随意拖放，带实时插入指示线，视觉与结果严格一致
- **内联编辑** — 新建/重命名分组、工作区、会话全部就地完成，告别浏览器弹窗
- **一键展开 / 折叠** — 全部分组一键收放，长列表不再翻到手酸
- **🔍 消息搜索** — 标题 + 消息全文双通道，快速定位任意会话
- **会话分叉 / 归档** — 生命周期操作一步到位

### 📊 Token 统计

- **行内精简总量** — 工作区标题下方一眼看到消耗规模
- **悬停明细卡** — 当前 / 含归档双口径，输入 / 输出 / 缓存读 / 缓存写四桶拆分，逐会话列表，按模型归因
- **总览面板** — 合计、分组小计、工作区排行（条形占比）、逐会话明细

### 💰 花费统计

- **按模型 × 单价 × 时段** 精确计价，不是平均估算
- **单价卡片设置** — 每个模型一张卡片，空闲 / 高峰两行三档单价
- **🟢 deepseek 全系默认官方价** — 内置 2026-08-17 峰谷定价（V4-Flash / V4-Pro），开箱即用，你改过的价格始终优先
- **⏱️ 三档时段口径**：
  - `全部`（默认）= 空闲桶按空闲价 + 高峰桶按高峰价（真实总花费）
  - `空闲` / `高峰` 只看对应时段
  - ✅ 恒等式：**全部 = 空闲 + 高峰**

### 📡 OpenCode Go 额度

- **三窗口用量** — 5 小时滚动 / 本周 / 本月，百分比 + 进度条（<50% 绿 / 50–80% 黄 / ≥80% 红）+ 重置时间
- **一键刷新** — 绕过缓存直连官方端点
- 密钥自动读取自 `~/.local/share/opencode/auth.json`（`opencode-go` / `opencode` 条目），零配置

> 💾 **数据存储**：分组与排序持久化到 Host 磁盘 `~/.dsh/wsfm-folders.json`（不随浏览器丢失，换浏览器/清理缓存仍在），浏览器 localStorage 仅作快速加载兜底；单价、费用缓存、额度缓存保存在浏览器 localStorage（`dsh.wsPrices.v1` / `dsh.wsCost.v1` / `dsh.wsUsage.v1`）；Host 侧费用结果持久化到 `~/.dsh/wsfm-cost.json`（按会话日志水位校验，重启不重算未变化的会话）。无服务端状态，卸载即清净。

---

## 🏗️ 架构

| 半 | 入口 | 职责 |
|---|---|---|
| 🖥️ Host | `src/index.ts` → `lib/index.js` | `/api/wsfm/tokens`、`/api/wsfm/cost`、`/api/wsfm/usage` 三个 **loopback-only** JSON 路由；读取会话投影缓存与会话日志，磁盘费用缓存，OpenCode Go 额度代理 |
| 🌐 Client | `src/client/index.js` → `lib/client.js` | ModuleLoader handoff bundle；注入 `sidebar.workspaces` 槽位 |

- 🪶 **零第三方运行时依赖** — host 侧零依赖，client 侧仅 peer 依赖 `react`
- 🔒 所有 API 带浏览器同源信任围栏，会话数据绝不上公网

---

## 🛠️ 构建

```bash
pnpm install
pnpm build
```

产出 `lib/index.js`（tsc）+ `lib/types/*.d.ts` + `lib/client.js`（ModuleLoader bundle）。

## 📦 安装

**本地开发**（构建后）：

```bash
dsh plugin --profile web add link:<本仓库路径>
```

**从 GitHub 安装**（仓库自带构建产物，无需本地构建）：

```bash
dsh plugin --profile web add github:Jadramcool/dsh-workspace-hub
```

**发布到 npm 后**：

```bash
dsh plugin --profile web add dsh-workspace-hub
```

## 🗑️ 卸载

```bash
dsh plugin --profile web remove workspace-hub
```

---

## 📄 License

[Apache-2.0](./LICENSE) © 2026 [jadramcool](https://github.com/jadramcool)

<p align="center">
  <sub>Made with ❤️ for the DSH community</sub>
</p>
