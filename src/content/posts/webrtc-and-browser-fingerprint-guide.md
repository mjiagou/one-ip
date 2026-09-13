---
title: 深入了解 WebRTC 泄露与浏览器指纹：如何保护你的网络隐私
date: 2026-09-12
description: 解析 WebRTC 的 STUN 连接机制为什么会暴露真实 IP，以及 FingerprintJS 与 CreepJS 是如何识别浏览器特征的。
tags: [WebRTC, 浏览器指纹]
author: 一个机场
---

# 深入了解 WebRTC 泄露与浏览器指纹：如何保护你的网络隐私

在很多用户的认知中，“只要开启了全局代理，我的网络身份就是完全匿名的”。然而在实际网络测试和风控系统中，即使代理运行正常，网页依然可能通过 **WebRTC** 和 **浏览器高级指纹技术** 准确定位你的真实身份。

本文将为您深入剖析这两大隐私泄露途径的原理及排查方案。

---

## 一、 WebRTC 是如何泄露真实 IP 的？

### 1. 什么是 WebRTC？

WebRTC（Web Real-Time Communication）是现代浏览器原生支持的实时通信协议，广泛应用于网页端视频通话、语音通信、屏幕共享和 P2P 文件传输。

### 2. 穿透机制（STUN/TURN）

为了让两个处于 NAT（路由器/防火墙）后面的客户端直接建立 P2P 连接，浏览器必须向外部公共 STUN（Session Traversal Utilities for NAT）服务器发送请求，询问“从公网看，我的本地 IP 和外网反射 IP 是什么”。

由于该网络请求往往直接由浏览器内核的套接字底层发起，如果网络客户端或代理规则未配置针对 UDP/STUN 请求的拦截或转发，STUN 请求可能会直接经由本地物理网卡发出，从而直接在响应中包含你的**家庭真实公网 IP**或**局域网私有 IP（如 192.168.x.x）**。

### 3. 如何自查？

访问 [一个机场 IP 的浏览器隐私检测页面](https://ip.ygjc.cc/browser/privacy)，系统会自动进行 STUN 握手测试，并将检测到的所有候选 IP 与网页当前加载的出口 IP 进行对比。如果候选列表中出现了你的家庭宽带 IP，即表明存在 WebRTC 泄露。

---

## 二、 什么是浏览器指纹（Fingerprinting）？

与传统的 Cookie（会被用户清理或无痕模式隔离）不同，浏览器指纹是一种**无状态的设备识别技术**。

网站通过 JavaScript 静默收集几十甚至上百项浏览器与硬件特征：

- **Canvas 指纹**：利用不同显卡、驱动和字体渲染引擎在绘制相同 2D/3D 图形时的微小像素级差异；
- **WebGL / 音频上下文（AudioContext）**：利用声卡处理正弦波信号时的频域响应差异；
- **硬件并发度与内存**：`navigator.hardwareConcurrency`、设备内存；
- **字体列表与系统扩展**：探测系统已安装的字体集；
- **环境一致性（Consistency）**：例如检查 `User-Agent` 声明是 macOS，但 WebGL 渲染器却显示为 Nvidia 显卡（典型虚拟机或伪装特征）。

---

## 三、 常见防护与改善建议

1. **禁用或限制 WebRTC**：
   - 可以在 Chrome/Edge 中安装相关 WebRTC 防护扩展（将策略设置为“Disable non-proxied UDP”），或在 Firefox 的 `about:config` 中设置 `media.peerconnection.enabled = false`。
2. **避免过度或粗糙的指纹伪装**：
   - 很多简单的防关联插件只是机械地随机修改 User-Agent，反而会制造极其罕见的指纹冲突（例如在 Windows 机器上伪装 iPhone UA），更容易触发风控警报。
3. **保持浏览器与环境一致**：
   - 保证系统时区、浏览器主语言与当前节点出口国家保持合理匹配。

欢迎使用 [一个机场 IP](https://ip.ygjc.cc/) 定期排查您的网络环境与指纹健康度！
