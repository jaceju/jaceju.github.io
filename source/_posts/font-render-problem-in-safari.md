---
layout: post
title: "在 Safari 中遇到文字粗細顯示不正確的問題"
date: 2014-03-20 12:04:47 +0800
comments: true
tags: ["CSS","WebKit"]
---

在製作公司官網時，遇到類似以下這個影片的問題。

​http://www.screenr.com/gZN8

也就是在有動畫效果時，某些元素上的文字粗細會被改變；然而實際用 DevTools 去查看該元素 CSS 時，會發現文字粗細樣式並沒有任何變化。

<!--more-->

後來找到這篇解法： ​[Safari changing font weights when unrelated animations are running](http://stackoverflow.com/questions/9733011/safari-changing-font-weights-when-unrelated-animations-are-running)

依照這一篇的解釋，是因為新的 webkit 在將 HTML 交由 GPU 繪製時如果有動畫效果，就會造成 `top` 和 `left` 的偏移；而 webkit 預設使用 `-web-font-smoothing: subpixel-antialiased` 來繪製文字，卻不是每個元素都套用，因此就會造成這個問題。

連結提供的解法有兩種：

解法一：從該動畫元素往上找到最上面那個位置會動的元素，為它加上 `position: relatvie` 及 `z-index` ，如果不行就用解法二。

解法二：強制指定 html 的 `-web-font-smoothing` 為 `antialiased` 或 `subpixel-antialiased` ，讓整個頁面的元素都繼承同一種文字樣式設定。

後來我用解法二，在 CSS 開頭加了這段：

```css
html {
  -webkit-font-smoothing: subpixel-antialiased;
}
```

問題就解決了。