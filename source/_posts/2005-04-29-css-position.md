---
layout: post
title: 'CSS 排版觀念：Position'
date: 2005-4-29
wordpress_id: 15
comments: true
tags: ["CSS"]
---

很多人都會用圖層來製作網頁，或許常會聽到所謂的絕對位置和相對位置。其實它們都是 CSS 中 `position` 的設定值，透過設定 `position` ，便能讓我們隨意移動元素的位置。

不過它們之間到底有什麼不同呢？本文做個簡單的說明。

<!--more-->

## 參數說明

首先我把其中的關係整理成表：

<table border="1" class="info-table" summary="CSS 排版觀念 position 參數說明">
<caption>
CSS 排版觀念 position 參數說明
</caption>
<tr>
<th>position 參數
/ 參數說明</th>
<th>absolute</th>
<th>relative</th>
<th>static(預設值)</th>
<th>fixed</th>
</tr>
<tr>
<th>中文意義</th>
<td>絕對位置</td>
<td>相對位置</td>
<td>靜態位置</td>
<td>固定位置</td>
</tr>
<tr class="alt">
<th>畫面位置參考基準</th>
<td>父元素內容區邊界</td>
<td>原本應該在的位置</td>
<td>不變</td>
<td>不指定：原本應該在的位置
指定：視窗最大可視範圍邊界 (或框架邊界) </td>
</tr>
<tr>
<th>移動參考基準</th>
<td>文件</td>
<td>文件</td>
<td>文件</td>
<td>視窗最大可視範圍</td>
</tr>
<tr class="alt">
<th>可改變顯示位置</th>
<td>是</td>
<td>是</td>
<td>否</td>
<td>是</td>
</tr>
<tr>
<th>可調整大小</th>
<td>是</td>
<td>display 為 block ：是
display 為 inline ：否 </td>
<td>display 為 block ：是
display 為 inline ：否</td>
<td>是</td>
</tr>
<tr class="alt">
<th>從顯示流程中去除</th>
<td>是</td>
<td>否</td>
<td>否</td>
<td>是</td>
</tr>
</table>

當我們對元素的 `position` 屬性，指定了 `absolute` 、 `relative` 或 `fixed` 後，這個元素就可以移動了。我們可以用 `top`, `left`, `right`, `bottom` 這四種屬性來指定元素要呈現的位置。

註：由於 IE 不支援 `position: fixed` ，使得固定位置這個好用的技巧一直不受大家的重視。但在這裡我還是提一下。你可以使用 FireFox 來感受一下固定位置的強大威力，或是等待新版的 IE 支援。

接下來我們來解釋上面的表列裡，每個參數說明的意義。

## 畫面位置參考基準

以絕對位置 (`position: absolute`) 而言，故名思義，它是以父元素的邊界為絕對起點。例如如果我們設定 `top: 50px` ，那麼這個元素就會在距離父元素內容區上邊界 50px 的地方呈現，如下圖：

![position: absolute](/resources/css_position/absolute_1.png)

__補充：__如果父元素的 `position` 不是 `absolute` 或 `relative` 時，那麼元素的位置就會再對應到父元素的上層元素；如果其親代元素的 `position` 都沒有設定 `absolute` 或 `relative` 時，就以視窗最大可視範圍邊界為基準。

而以相關位置 (`position: relative`) 而言，其意義就是相對於原本的位置。例如我們指定 top: 50px 時，那麼這個元素就會從原本應該呈現的位置往下移動 50px 。如下圖，紅色虛線部份就是未設定 position: relative 前，元素原該應該在的位置：

![position: relative](/resources/css_position/relative_1.png)

而固定位置 (position: fixed) 指的就是固定在視窗最大可視範圍上，如果不指定位置 (top, left, right, bottom) 時，那元素就會固定在原本的位置；而指定位置後，就會以視窗最大可視範圍的邊界為絕對基準點。如果頁面內容超過視窗最大可視範圍大小時，那麼不論我們如何捲動頁面，元素都會固定在視窗最大可視範圍上我們所指定的位置。

## 移動參考基準

當頁面可以捲動的時候， `absolute` 、 `relative` 、 `static` 都會跟著移動。只有 `fixed` 會固定在視窗最大可視範圍上，不會跟著移動。

## 可改變顯示位置

就是我們可以透過指定元素的 `top` 、 `left` 、 `right` 、 `bottom` 四個屬性，使元素改變顯示位置。如果元素是 `position: static` 時，會自動忽略所設定的 `top` 、 `left` 、 `right` 、 `bottom` 。

## 可調整大小

我們可以透過 `width` 、 `height` 來調整元素內容區的大小，不過當 `position` 是 `relative` 或是 `static` 時，元素的 `display` 屬性必須為 `block` 才可調整其大小。

## 從顯示流程中去除

顯示流程的意義就是頁面上的每一個元素的呈現，換句話說，就是該元素會出現的位置，及其佔用的空間等等。

我們可以將原來的頁面想成是一個圖層，每個元素都是一個一個緊接在前一個元素後面。如下圖，在尚未指定 `position` 時，粉紫色區塊會緊接在淺藍色區塊後。

![從顯示流程中去除_1](/resources/css_position/layer1.png)

請注意，我在這裡提到的圖層，指的是瀏覽器去解譯 HTML 後，將元素呈現出來的圖層，而非一般我們所認為，以絕對位置呈現的圖層；你可以把它想像成是 Photoshop 裡的圖層。

當我們指定淺藍色區塊的 `position` 屬性為 `absolute` 或 `fixed` 後，淺藍色區塊就會跑到另一個圖層；而粉紫色區塊因為淺藍色區塊已經從原圖層的顯示流程中去除了，所以它就自動往上跑。如下圖，紅色虛線就是粉紫色區塊原本的位置。

![從顯示流程中去除_2](/resources/css_position/layer2.png)

而元素如果指定為 `relative` 時，雖然也能移動，但原本的頁面圖層還是會保留該元素所佔有的空間。

## 後記

或許你在看完這篇文章之後，還是無法很清楚地了解 `position` 屬性的運作方式。建議你打開你的瀏覽器 (最好是用 Firefox) ，再用你慣用的 HTML 編輯器去試試它們之間的差異。然後回來看看這篇文章，你也許就能明白我的意思。

__補充：__如果頁面在框架裡時 (`frame` 或 `iframe`) ，所有參照視窗最大可視範圍邊界的元素就會改為參照框架邊界。

## 範例

以下這個範例，你可以看到設定 position 前及設定 position 後的關係：

<iframe width="80%" height="300" src="/resources/css_position/position_test.htm"></iframe>