# 如何對舊有 PHP 專案做測試

如果你面對的是以前舊有的 PHP 程式，是時候負起一些責任了。

我知道它改起來很痛苦，一堆不良的 PHP 程式習慣都阻礙你的修正；使得每次調整功能時，到底改得對不對，得要等到上線才知道。想要打掉重寫，但太多的實作細節你不清楚；也沒有最新的規格文件，讓你無法為新版本做出功能無誤的保證。

現在你唯一擁有的，就是已經在線上運作的程式邏輯；雖然它可能還有 bug ，但至少大多數的功能是通過使用者驗證的。那麼先為它買個保險吧！確保之後的修改不會影響到其他功能的正常運作。

<!-- more -->

## 如何確保功能的正常運作

最直接也最保險的方式，就是把目前程式邏輯所呈現的結果或是使用者的操作，寫成自動化 Web 測試 (即驗收測試的其中一環) 。它的原理是將

做自動化 Web 測試的工具有很多種，可以參考維基百科上的 [List of web testing tools](https://en.wikipedia.org/wiki/List_of_web_testing_tools) 一文。

## Web 測試四劍客

PHPUnit

Mink

Selenium

PhantomJS

## 流程

執行 PhantomJS with WebDriver

```bash
phantomjs --webdriver=4444
```

在 PHPUnit 的 TestCase 中使用 Mink

```php
$driver = new Selenium2Driver('phantomjs');
```
