title: 好用的 Laravel 測試工具 Laravel TestTools
tags: ["Laravel", "測試"]

---

[Marcel Pociot](http://marcelpociot.com/) [發表](http://marcelpociot.com/blog/2016-03-21-laravel-testtools)了一個 [Chrome Extension](https://chrome.google.com/webstore/detail/laravel-testtools/ddieaepnbjhgcbddafciempnibnfnakl) ，用來協助 Laravel 開發者錄製網頁動作，並轉換成 Laravel Web Testing Code 。

乍看之下，它跟 Firefox 上的 Selenium IDE 很類似，但 Selenium IDE 如果要產生出 Laravel Integration Testing Framework 可以用的程式碼，就得自己寫一個 Formatter 來轉換。不過作者有提到，因為這個 extension 產生的語法是專屬 Laravel Integration Testing Framework ，所以並沒有辦法透過 WebDriver 來操作以 JavaScript 互動的網頁。

以下簡單介紹它的用法：

<!-- more -->

