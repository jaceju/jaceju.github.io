---
title: "ScrollSpy 簡介"
date: 2014-02-21 11:16:00 +08:00

tags: [ JavaScript]
---

在 Single Page Design 中，我們常會把落落長的頁面分成幾個區塊，然後在上方或側邊選單中以這些區塊的標題來做為選單項目。

<!-- more -->

而當我們點選選單項目時，頁面會自動跳到 (或捲動到) 該區塊，而選單項目會反白。反過來如果我們捲動到該區塊時 (即該區塊佔了螢幕一定比例的大小，或是標頭到達某一特定位置) ，對應該區塊的選單項目也會自動反白。

這個效果就稱為「 ScrollSpy 」。

以下連結分享了許多已經採用 ScrollSpy 特效的網站，大家不妨參考看看：

http://www.hongkiat.com/blog/scrollspy-navigation-websites/

目前有很多套件可以做到 ScrollSpy 的效果了，例如 Bootstrap 3 就包含了這個套件：

http://getbootstrap.com/javascript/#scrollspy

另外也有獨立的 jQuery Plugin ：

* https://github.com/thesmart/jquery-scrollspy
* https://github.com/sxalexander/jquery-scrollspy
* http://www.dynamicdrive.com/dynamicindex1/ddscrollspymenu.htm

如果你不想用 jQuery 或是想瞭解 ScrollSpy 的原理，以下便是一個使用純 JavaScript 所寫的 ScrollSpy 類別：

https://gist.github.com/pascaldevink/2380129
