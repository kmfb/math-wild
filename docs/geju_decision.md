# v0.3 设计决策

## Thesis

Manim scene 是视频与关键帧的事实源；海报只是从关键帧组合出来的副产品。

## Why

如果继续维护 Pillow 预览渲染器，最终会变成我们自己手搓一个低配 Manim。  
v0.3 的目的就是删除这个错误路径，把生产链回到：

```text
scene spec → compiler → Manim scene → render → keyframes → poster → verify
```

## 不可妥协原则

1. spec 管数学事实。
2. Manim 管视觉表达。
3. poster composer 只组合关键帧，不重新画数学。
4. verifier 在渲染前检查数学结构。

## 当前证明点

同一个 `chapters/<chapter>/chapter_spec.json` 能生成：

- Manim video scene
- 6 个 keyframe scenes
- verification report

下一步是在本地或 Docker 环境中实际渲染。
