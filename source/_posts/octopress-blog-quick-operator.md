---
layout: post
title: "Octopress Blog Quick Operator"
date: 2011-11-26 13:51
comments: true
tags: Octopress
---
在調整 Octopress 的過程中，找到一篇不錯的參考文章：[換到octopress](http://hychen.wuweig.org/blog/2011/11/13/huan-dao-octopress/) 。

<!-- more -->

不過原作者的指令在操作上比較不適合我，因此我將它稍作了改良：

{% gist 1395104 %}

## 安裝方法

把它命名為 blog ，並放到 PATH 系統變數可以找到的路徑下，然後設定為可執行即可。

註：上面的程式碼區塊檔名為 blog.sh 其實只是為了要用 Gist 的程式碼變色效果。 :P

## 用法

建立新文章：

```bash
blog post "post title"
```

僅預覽新文章：

```bash
blog preview "post title"
```

預覽全站：

```bash
blog preview
```

然後再用瀏覽器打開 `http://localhost:4000` 。

發佈文章：

```
blog deploy
```

更新 octopress ：

```
blog update
```