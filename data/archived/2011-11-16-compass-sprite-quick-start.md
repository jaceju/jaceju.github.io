---
layout: post
title: "Compass Sprite Quick Start"
date: 2011-11-16 16:53
comments: true
tags: Compass
---
用了 Compass Sprite 後，快速做個筆記，免得之後又忘了。

Compass Sprite 可以幫我們快速製作 CSS Sprite ，它有幾個特色：

- 可以不需要自行把圖檔串連起來， Compass Sprite 會自動幫我們處理。不過可惜它只支援 PNG 格式的圖檔，這點使用上要小心。
- 自動幫我們產生 Sprite CSS ，我們只要在適當的元素的屬性上加入對應的 class 就可以了。

以下是簡單的使用流程：

<!--more-->

首先在專案的 `images` (在 `config.rb` 中定義的那個) 底下建立一個目錄，名稱自訂，這邊以 `actions` 為例。

接著在 images/actions 下放幾個 PNG 圖檔，寬度要一致，因為預設 Compass Sprite 會垂直串接起所有圖檔。

這裡我假設有以下的圖檔：

- `images/actions/create.png`
- `images/actions/delete.png`
- `images/actions/update.png`

然後在你的 SCSS/SASS 中加入以下程式碼：


```sass
@import "actions/*.png"
@include all-actions-sprites

```


註：注意 all-[folder]-sprites 這個用法，我在這裡卡了很久。

最後在你的 HTML 元素中，使用：


```html
<span class="actions-create">建立</span>
<span class="actions-delete">刪除</span>
<span class="actions-update">更新</span>

```

這樣就可以了，很簡單吧，快試試看。

