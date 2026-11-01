<div align="center">

# 🎵 DanmuPlayer 弹幕音乐播放器

**一款集成 B 站弹幕的桌面音乐播放器**

A desktop music player with Bilibili danmaku (bullet comments) overlay.

![Electron](https://img.shields.io/badge/Electron-31-47848F?style=flat-square&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## ✨ 功能亮点 / Features

| 功能 | 说明 |
|------|------|
| 🎵 **网易云音乐** | 搜索、播放网易云音乐，支持多种音质 / Search & play from Netease Cloud Music |
| 💬 **B 站弹幕** | 实时弹幕叠加在播放界面上，支持按来源着色 / Real-time Bilibili danmaku overlay with source-based coloring |
| 📝 **歌词同步** | LRC 歌词逐行高亮，点击歌词可跳转 / Synchronized lyrics with click-to-seek |
| 🎨 **毛玻璃 UI** | 深色/浅色双主题，封面动态模糊背景 / Glassmorphism UI with dark/light themes |
| ⌨️ **快捷键** | 全局键盘快捷键 + 系统媒体键支持 / Keyboard shortcuts + system media key support |
| 🔐 **Cookie 登录** | 通过浏览器 Cookie 登录，可播放 VIP 歌曲 / Login via browser cookie for VIP songs |
| 💾 **状态持久化** | 播放列表、音量、设置自动保存 / Playlist, volume, and settings auto-saved |
| 🖥️ **系统托盘** | 关闭窗口最小化到托盘，媒体键全局控制 / Minimize to tray with global media key control |

---

## 🛠️ 技术栈 / Tech Stack

| 层级 | 技术 |
|------|------|
| 框架 | [Electron 31](https://www.electronjs.org/) |
| 前端 | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| 状态管理 | [Zustand](https://github.com/pmndrs/zustand) |
| 样式 | [TailwindCSS](https://tailwindcss.com/) + 自定义 CSS |
| 构建 | [electron-vite](https://electron-vite.org/) |
| 网络 | [Axios](https://axios-http.com/) |
| XML 解析 | [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) |

---

## 🚀 快速开始 / Getting Started

### 环境要求 / Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9

### 安装 / Install

```bash
# 克隆仓库 / Clone the repository
git clone https://github.com/xxyouka/danmu-player.git
cd danmu-player

# 安装依赖 / Install dependencies
npm install
```

### 开发 / Development

```bash
npm run dev
```

启动 Electron 开发模式，支持热更新。

Starts Electron in dev mode with hot reload.

### 构建 / Build

```bash
# 构建生产版本 / Build for production
npm run build

# 类型检查 / Type check
npm run typecheck
```

构建产物在 `out/` 目录，Windows 安装包在 `dist/` 目录。

Build output is in `out/`, Windows installer in `dist/`.

---

## ⌨️ 快捷键 / Keyboard Shortcuts

| 按键 / Key | 功能 / Action |
|------------|--------------|
| `Space` | 播放 / 暂停 Play / Pause |
| `←` | 上一首 Previous track |
| `→` | 下一首 Next track |
| `↑` | 音量 +5% Volume up |
| `↓` | 音量 -5% Volume down |
| `M` | 静音切换 Toggle mute |
| `D` | 弹幕开关 Toggle danmaku |

系统媒体键（播放/暂停、上一首、下一首、停止）同样支持。

System media keys (Play/Pause, Next, Previous, Stop) are also supported.

---

## 📁 项目结构 / Project Structure

```
danmu-player/
├── electron/
│   ├── main/
│   │   ├── index.ts        # Electron 主进程入口
│   │   ├── netease.ts      # 网易云音乐 API 封装
│   │   └── bilibili.ts     # B 站 API 封装（搜索 + 弹幕）
│   └── preload/
│       └── index.ts        # 预加载脚本（IPC 桥接）
├── src/
│   ├── components/
│   │   ├── AlbumCover.tsx   # 封面组件（旋转动画）
│   │   ├── DanmakuCanvas.tsx # 弹幕 Canvas 渲染
│   │   ├── LoginPanel.tsx   # Cookie 登录面板
│   │   ├── LyricDisplay.tsx # 歌词显示（自动滚动）
│   │   ├── PlayerControls.tsx # 播放控制栏
│   │   ├── Playlist.tsx     # 播放列表
│   │   ├── SearchPanel.tsx  # 搜索面板
│   │   ├── SettingsPanel.tsx # 设置面板
│   │   ├── Sidebar.tsx      # 侧边栏导航
│   │   └── SongInfo.tsx     # 歌曲信息
│   ├── hooks/
│   │   ├── useDanmaku.ts    # 弹幕逻辑（加载、轨道、渲染）
│   │   ├── useLyric.ts      # 歌词解析与同步
│   │   └── usePlayer.ts     # 播放器核心逻辑
│   ├── stores/
│   │   ├── playerStore.ts   # 播放状态（Zustand + 持久化）
│   │   └── settingsStore.ts # 设置状态（Zustand + 持久化）
│   ├── types/
│   │   ├── danmaku.ts       # 弹幕类型定义
│   │   ├── electron.d.ts    # Electron API 类型
│   │   └── music.ts         # 音乐类型定义
│   ├── styles/
│   │   └── index.css        # 全局样式
│   ├── App.tsx              # 根组件
│   └── main.tsx             # React 入口
├── resources/
│   └── icon.png             # 应用图标
├── electron-builder.json5   # 打包配置
├── electron.vite.config.ts  # Vite 构建配置
├── tailwind.config.js       # TailwindCSS 配置
├── tsconfig.json            # TypeScript 配置
└── package.json
```

---

## 🔧 配置说明 / Configuration

### 登录网易云 / Netease Login

1. 在浏览器中打开 [music.163.com](https://music.163.com) 并登录
2. 按 `F12` 打开开发者工具
3. 切换到 `Application` → `Cookies` → `https://music.163.com`
4. 复制 `MUSIC_U` 的值
5. 在应用中点击「登录」，粘贴 Cookie

> 登录后可播放 VIP 歌曲，Cookie 有效期通常为数月。
>
> Login enables VIP song playback. Cookies typically last several months.

### 弹幕设置 / Danmaku Settings

在设置面板中可以调整：

- **弹幕开关** — 全局开关 / Global toggle
- **弹幕来源** — 官方 MV / Reaction / 热评 / Official MV, Reaction, Hot comments
- **弹幕字号** — 12px ~ 24px
- **透明度** — 30% ~ 100%
- **滚动速度** — 10% ~ 100%
- **颜色区分来源** — 不同来源用不同颜色 / Color-code by source

---

## ❓ 常见问题 / FAQ

**Q: 搜索没有结果？**
A: 请检查网络连接。网易云 API 可能需要登录 Cookie 才能正常使用。

**Q: 弹幕没有显示？**
A: 确认弹幕开关已开启（按 `D` 键切换）。如果 B 站搜索无结果，可能是该歌曲没有对应的 B 站视频。

**Q: 歌曲播放失败？**
A: 系统会自动尝试多个 API 源。如果全部失败，可能是版权限制或网络问题，尝试登录 Cookie。

**Q: 如何更新应用？**
A: 重新 `npm run build` 即可，设置和播放列表会自动保存。

---

## 🤝 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！请先阅读 [贡献指南](CONTRIBUTING.md)。

Issues and pull requests are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) first.

---

## 📄 许可 / License

MIT © 2026 xx

本项目代码以 MIT 许可开源；网易云音乐 / B 站的内容与接口版权归各自权利人所有，本项目仅用于学习与个人使用。

Built by [xx](https://github.com/xxyouka).
