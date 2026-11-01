# 贡献指南 / Contributing Guide

感谢你对 DanmuPlayer 的关注！以下是参与贡献的指南。

Thank you for your interest in DanmuPlayer! Here's how to contribute.

---

## 🛠️ 开发环境搭建 / Setup

```bash
# 1. Fork 并克隆仓库 / Fork and clone
git clone https://github.com/your-username/danmu-player.git
cd danmu-player

# 2. 安装依赖 / Install dependencies
npm install

# 3. 启动开发模式 / Start dev mode
npm run dev

# 4. 类型检查 / Type check
npm run typecheck
```

### 环境要求 / Requirements

- Node.js >= 18
- npm >= 9
- Windows / macOS / Linux

---

## 📋 开发规范 / Code Standards

### 代码风格 / Code Style

- **TypeScript** — 严格模式，不允许 `any`（已有的需逐步修复）
- **React** — 函数组件 + Hooks，不使用 class 组件
- **状态管理** — Zustand，全局状态放 `stores/`，局部状态用 `useState`
- **样式** — 全局样式在 `src/styles/index.css`，组件级样式也写在此文件中
- **命名** — 组件用 PascalCase，hooks/utilities 用 camelCase，类型用 PascalCase

### 目录约定 / Directory Conventions

```
src/
├── components/    # React 组件（一个文件一个组件）
├── hooks/         # 自定义 Hooks（use 前缀）
├── stores/        # Zustand stores
├── types/         # TypeScript 类型定义
└── styles/        # 全局 CSS
```

### 提交规范 / Commit Messages

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>: <description>

feat: 新功能
fix: 修复 bug
refactor: 重构（不改变行为）
style: 样式调整（不影响逻辑）
docs: 文档更新
chore: 构建/工具链变更
perf: 性能优化
test: 测试相关
```

示例 / Examples：

```
feat: 添加歌词翻译显示
fix: 修复弹幕轨道不释放的问题
refactor: 将播放逻辑提取到 usePlayer hook
docs: 更新 README 安装说明
```

---

## 🔀 Pull Request 流程 / PR Process

1. **Fork** 仓库
2. 从 `master` 创建分支：`git checkout -b feat/your-feature`
3. 提交更改，遵循提交规范
4. 确保类型检查通过：`npm run typecheck`
5. 推送到你的 Fork
6. 创建 Pull Request，填写 PR 模板

### PR 要求 / PR Requirements

- [ ] `npm run typecheck` 无错误
- [ ] 代码遵循项目风格
- [ ] 提交信息符合 Conventional Commits
- [ ] 新功能附带必要的类型定义
- [ ] 如有 UI 变更，说明变更内容

---

## 🐛 报告 Bug / Reporting Bugs

使用 [Bug Report 模板](/.github/ISSUE_TEMPLATE/bug_report.md) 创建 Issue，请包含：

- 操作系统和版本
- 复现步骤
- 预期行为 vs 实际行为
- 控制台错误日志（如有）

---

## 💡 功能建议 / Feature Requests

使用 [Feature Request 模板](/.github/ISSUE_TEMPLATE/feature_request.md) 创建 Issue，请说明：

- 你想要什么功能
- 为什么需要这个功能
- 你期望的实现方式（可选）

---

## 📮 联系方式 / Contact

如有问题，欢迎通过 Issue 或 Discussion 交流。

For questions, feel free to open an Issue or Discussion.
