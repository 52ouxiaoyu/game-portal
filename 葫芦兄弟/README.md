# 🎮 葫芦爷救娃娃

> 一款基于经典动画《葫芦兄弟》的横版像素冒险闯关游戏

## 🚀 立即游戏

### 👉 [点击这里在线游玩](https://52ouxiaoyu.github.io/Calabash-Brothers/) 👈

**无需下载，打开浏览器即可畅玩！**

---

> 在这款充满童年回忆的游戏中，你将扮演勇敢的葫芦娃，穿越森林、翻越高山、闯入蛇精洞府，最终打败蛇精，拯救爷爷！

---

## 🖼️ 游戏预览

游戏采用经典的像素艺术风格，画面色彩鲜艳，充满怀旧感：

- **主菜单**：深蓝色背景上展示7位葫芦娃角色，每位对应不同的颜色，等待你按数字键选择
- **森林关卡**：翠绿的树木和草地，蜿蜒的平台构成冒险之路
- **山岭关卡**：棕色山脉连绵起伏，雪山点缀其间
- **蛇精洞府**：幽暗的紫色洞穴，钟乳石从顶部垂下，星光点点
- **战斗场面**：粒子爆炸特效、屏幕震动反馈、Boss血条实时显示

---

## ✨ 游戏特色

- 🎨 **像素艺术精灵系统** — 精心绘制的角色和敌人像素画
- 🎵 **复古音效引擎** — 基于 Web Audio API 的8-bit风格音效
- 💥 **粒子特效系统** — 爆炸、收集、击败Boss时的华丽粒子效果
- 📳 **屏幕震动反馈** — 受伤和攻击时的震撼屏幕抖动
- 🐍 **经典Boss战** — 与蛇精的终极对决，3血量、投射物攻击
- 🎭 **7个可选角色** — 七位颜色各异的葫芦娃
- 🏔️ **3个精心设计的关卡** — 从森林到洞府，难度逐级递增
- 🔊 **完整音频控制** — 支持静音切换

---

## 🚀 快速开始

### 方法一：直接打开（推荐）

1. 确保你的电脑上有现代浏览器（Chrome、Firefox、Edge、Safari 均可）
2. 双击 `index.html` 文件，或将其拖入浏览器窗口
3. 游戏即刻开始！

### 方法二：使用本地服务器

```bash
# 进入游戏目录
cd Mario

# 使用 Python 启动本地服务器
python3 -m http.server 8080

# 打开浏览器访问
# http://localhost:8080
```

### 方法三：使用 Node.js

```bash
npx serve .
```

> ⚠️ 注意：本游戏是纯 HTML5 单文件应用，**无需安装任何依赖**，无需构建步骤，直接打开即可游玩！

---

## 🎮 游戏操作

| 按键 | 功能 | 说明 |
|:---:|:---:|:---|
| `A` / `←` | 向左移动 | 控制葫芦娃向左行走 |
| `D` / `→` | 向右移动 | 控制葫芦娃向右行走 |
| `W` / `G` / `↑` / `空格` | 跳跃 | 从上方踩踏敌人可消灭它们 |
| `S` | 蹲下/减速 | 按住时移动速度减慢，便于精确操控 |
| `K` | 特殊技能 | 向面朝方向冲刺，有冷却时间 |
| `1` ~ `7` | 选择角色 | 仅在菜单界面生效，选择不同的葫芦娃 |
| `R` | 重新开始 | 在游戏中重置当前关卡，在结束画面返回菜单 |
| `ESC` | 暂停/继续 | 切换游戏暂停状态 |
| `M` | 静音/取消静音 | 切换游戏音效开关 |
| `F1` | 调试模式 | 显示 FPS、粒子数、当前关卡等调试信息 |

### 💡 战斗技巧

- **踩踏攻击**：从上方落下踩到敌人可以消灭它们（对Boss造成伤害）
- **弹跳连击**：踩踏敌人后会自动弹起，可以连续踩踏多个敌人
- **躲避Boss**：Boss会向你发射紫色投射物，注意走位闪避
- **收集葫芦瓶**：地图上散布的葫芦瓶可以恢复1点生命值

---

## 🧑‍🤝‍🧑 游戏角色

七位葫芦娃，每位都有独特的颜色标识：

| 编号 | 名称 | 颜色 | 介绍 |
|:---:|:---:|:---:|:---|
| 1 | 🔴 大娃 | 红色 | 力大无穷的大哥，勇敢无畏 |
| 2 | 🟠 二娃 | 橙色 | 千里眼、顺风耳，机智灵敏 |
| 3 | 🟡 三娃 | 黄色 | 铜头铁臂，刀枪不入 |
| 4 | 🟢 四娃 | 绿色 | 能喷火的勇猛战士 |
| 5 | 🔵 五娃 | 青色 | 能吸水吐水，智慧过人 |
| 6 | 🔷 六娃 | 蓝色 | 会隐身术，神出鬼没 |
| 7 | 🟣 七娃 | 紫色 | 拥有宝葫芦，最终的希望 |

> 💡 所有角色拥有相同的5点生命值和基础能力，主要区别在于颜色标识。选择你最喜欢的颜色开始冒险吧！

---

## 🏔️ 关卡介绍

### 第一关：森林冒险 🌲

深入神秘的葫芦山森林，这里栖息着蛇和蝎子等危险生物。茂密的树木构成天然的平台，你需要在林间跳跃穿梭，收集散落的葫芦瓶补充体力。

- **环境**：翠绿的森林，树木背景
- **敌人**：蛇（地面巡逻）、蝎子（地面巡逻）
- **特色**：适合新手的入门关卡，敌人数量适中

### 第二关：翻山越岭 ⛰️

翻越险峻的山脉，这里的地形更加复杂，蝙蝠在空中盘旋。你需要更精准的跳跃技巧来穿越层层平台。

- **环境**：棕色山脉，雪山背景
- **敌人**：蛇（地面）、蝙蝠（飞行，正弦波轨迹）
- **特色**：引入飞行敌人，难度明显提升

### 第三关：蛇精洞府 🕳️

闯入蛇精的老巢——阴森的洞穴！这里不仅有各种敌人，还有强大的蛇精Boss等待着你。只有击败蛇精，才能通关拯救爷爷！

- **环境**：幽暗洞穴，钟乳石和星光
- **敌人**：蛇、蝎子、蝙蝠，以及 **Boss蛇精**
- **特色**：Boss战，击败蛇精后出口解锁

---

## 👹 敌人介绍

| 敌人 | 类型 | 行为模式 | 出现关卡 |
|:---:|:---:|:---|:---:|
| 🐍 蛇 | 地面 | 在平台上左右巡逻，遇到边缘或障碍会掉头 | 1, 2, 3 |
| 🦂 蝎子 | 地面 | 在平台上缓慢巡逻，与蛇行为类似但速度较慢 | 1, 3 |
| 🦇 蝙蝠 | 飞行 | 水平移动的同时上下浮动（正弦波轨迹），难以预测 | 2, 3 |
| 🐍 蛇精（Boss） | Boss | 在洞穴顶部左右移动，定期向玩家发射紫色投射物 | 3 |

### Boss 战机制

- **血量**：3 点生命值（屏幕顶部显示血条）
- **攻击方式**：每隔一段时间发射一枚追踪投射物
- **受伤判定**：从上方踩踏Boss造成1点伤害
- **击败奖励**：获得 500 分 + 华丽的胜利粒子特效
- **通关条件**：击败Boss后，关卡出口解锁，走向出口即可通关

---

## ⚙️ 游戏机制

### ❤️ 生命值系统

- 初始生命值：**5 点**
- 受到伤害：-1 生命值
- 收集葫芦瓶：+1 生命值（不超过上限）
- 生命值归零：游戏结束
- 落出地图：直接死亡

### 🛡️ 无敌帧

- 受伤后获得 **60帧（约1秒）** 的无敌时间
- 无敌期间角色闪烁，不会再次受伤
- 受到Boss投射物伤害也会获得无敌帧

### 🏆 分数系统

| 行为 | 得分 |
|:---|:---:|
| 消灭普通敌人 | +100 |
| 攻击Boss（每次） | +100 |
| 击败Boss | +500 |
| 收集葫芦瓶 | +50 |

### 🎲 难度递进

1. **关卡1**：5个敌人（蛇+蝎子），5个葫芦瓶
2. **关卡2**：6个敌人（蛇+蝙蝠），5个葫芦瓶，更复杂的地形
3. **关卡3**：Boss + 5个小怪，6个葫芦瓶，最终决战

---

## 🛠️ 技术栈

本游戏完全基于原生 Web 技术构建，**零外部依赖**：

| 技术 | 用途 |
|:---|:---|
| **HTML5 Canvas** | 游戏画面渲染（832×832 像素画布） |
| **原生 JavaScript** | 游戏逻辑、物理引擎、状态管理 |
| **Web Audio API** | 8-bit风格音效合成（跳跃、收集、受伤、胜利等） |
| **CSS** | 页面布局和样式 |
| **像素艺术** | 手工编码的字符矩阵精灵系统 |

### 架构设计

```
Game Architecture
├── Pixel Art System        # 字符矩阵 → 像素精灵渲染
├── Sound Manager           # Web Audio API 音效合成
├── Particle System         # 粒子发射与生命周期管理
├── Screen Shake            # 屏幕震动效果
├── Physics Engine          # 重力 + AABB碰撞检测
├── Enemy AI                # 巡逻/飞行/Boss行为
├── State Machine           # menu → playing → gameover/victory
└── Input Handler           # 键盘事件映射
```

---

## 📝 开发指南

### 如何修改关卡

在 `index.html` 中找到 `buildLevel` 函数（约第481行），每个关卡的定义包括：

```javascript
// 平台定义 [网格X, 网格Y]（每个网格32像素）
const pDefs = [[3,18],[7,16],[12,14]...];
// 每个平台宽度为 TILE*2 或 TILE*3

// 敌人定义 [像素X, 像素Y, 类型]
const eDefs = [
  [8*TILE, (GRID-2)*TILE, 'snake'],  // 蛇
  [15*TILE, (GRID-2)*TILE, 'scorpion'],  // 蝎子
  [14*TILE, (GRID-2)*TILE, 'bat'],  // 蝙蝠
];

// 收集品定义 [像素X, 像素Y]
const bDefs = [[4*TILE,17*TILE],[11*TILE,13*TILE]...];
```

### 如何添加新角色

在 `GOURDS` 数组（约第439行）中添加新条目：

```javascript
{ name: '八娃', color: '#ff69b4', dark: '#cc3388' }
```

### 如何调整游戏参数

| 参数 | 位置 | 默认值 | 说明 |
|:---|:---|:---:|:---|
| `GRAVITY` | 第49行 | 0.6 | 重力加速度 |
| `JUMP_FORCE` | 第51行 | -12 | 跳跃力度（负值=向上） |
| `ENEMY_SPEED` | 第52行 | 1.5 | 地面敌人移动速度 |
| `BAT_SPEED` | 第53行 | 2 | 蝙蝠移动速度 |
| `TILE` | 第47行 | 32 | 地砖大小（像素） |

### 如何添加新音效

在 `SoundManager` 类中添加新方法，使用 `playTone` 生成合成音效：

```javascript
playPowerUp() {
  this.playTone(400, 0.1, 'sine', 1200, 0.15);
  setTimeout(() => this.playTone(800, 0.2, 'sine', 1600, 0.12), 100);
}
```

---

## 📋 项目结构

```
Mario/
├── index.html          # 游戏主文件（单文件应用，包含所有代码）
└── README.md           # 本说明文档
```

---

## 🐛 已知问题

- 所有葫芦娃角色在游戏中使用相同的精灵图（仅HUD颜色不同）
- `FRICTION` 常量已定义但未在物理引擎中实际应用
- `W` 和 `S` 键未映射任何功能（跳跃使用 `G` 键）
- `K` 键（特殊技能）尚未实现

---

## 📜 许可证

本项目采用 [MIT License](https://opensource.org/licenses/MIT) 开源许可证。

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

*🎮 现在就打开 `index.html`，选择你的葫芦娃，开始拯救爷爷的冒险吧！*
