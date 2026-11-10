# lxgwwenkai-vp

霞鹭文楷 Web 字体分发（用于 [Miracle](https://github.com/AgxCOy/blogs) 的整合版“动态字重”分发）

~~起因是发现中国网字计划拆出来的字体莫得粗细变化（也就是`<strong>`渲染出来并不粗体，在 vitepress 搭起来的主题上比较明显）。~~ 但最近问了下大肥鱼有关字体 CDN 的问题，发现我这么`@import`反倒失去了按需加载的优势（每个分块都需），同时引入了高并发，属于两头不是人（）

> 旧版 npmjs 包：[@agxcoy/lxgw-wenkai-vp-hope](https://www.npmjs.com/package/@agxcoy/lxgw-wenkai-vp-hope)。
> 自行选配 CDN 回流。不定期更新，或者不再更新。
