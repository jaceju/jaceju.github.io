---
title: '整理一些常見的 PHP 錯誤'
date: 2014-07-21T10:51:03+08:00
tags:
  - PHP
---

最近有數篇文章介紹了 PHP 開發者常見的錯誤，我順手整理如下：

<!-- more -->

[10 Common PHP Coding Errors](http://www.toptal.com/php/10-most-common-mistakes-php-programmers-make)

1. 在 foreach 迴圈中使用了迭代項目的參考。
2. 誤用了 isset 。
3. 搞混了回傳值是傳參考還是傳值。
4. 在迴圈中執行不必要的 SQL Query 。
5. 一次取得太多結果，造成不必要的記憶體浪費。
6. 忽略了 Unicode / UTF-8 問題。
7. 總是假設 $_POST 會包含 POST 資料。
8. 沒有注意 PHP 不支援 char 字元型態。
9. 對編碼標準的忽略，尤其是 PSR 標準 (當然有些依據不見得好，但也是大家討論出來的標準) 。
10. 誤用了 empty 函式。

[Common PHP Mistakes](http://afilina.com/common-php-mistakes/)

1. 忘了使用快取機制來減少大量 requests 對系統的衝擊。
2. 沒有避開 SQL Injection 。
3. 開發時關掉了錯誤回報。
4. 表單 POST 後還停留在同一頁。
5. 沒有善用已經存在的工具，而重造輪子。
6. 關掉了 timeout 機制，讓 script 沒有停止的依據。
7. 忽略了網站可用性。

[7 More Mistakes Commonly Made by PHP Developers](http://www.sitepoint.com/7-mistakes-commonly-made-php-developers/)

1. 使用過時的 mysql extention 。
2. 沒有使用 PDO 的參數機制來避免 SQL Injection 。
3. 沒有重寫網址，讓它符合現今的網址守則。
4. 抑制錯誤訊息的發生。
5. 在條件判斷式中賦值。
6. 曝露太多有關系統所使用的 Framework 資訊。
7. 沒有移除掉開發時的設定檔。


