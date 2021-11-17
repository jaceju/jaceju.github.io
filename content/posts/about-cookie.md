---
title: '[Web] Cookie 小觀念'
date: 2009-04-16T00:00:00+08:00
tags:
  - 'Web 開發'
---

## 問題

剛剛被問了一個 Cookie 的觀念，這邊簡單分享給大家。

先來看以下這個程式，請問它第一次執行時結果是什麼？

```php
setcookie('test', 'abc');
var_dump($_COOKIE);
```

如果你回答的是空陣列的話，那就表示你瞭解 Cookie 的作用了。

<!-- more -->

## 說明

當我們在使用 `setcookie` 這個函式時，其實是在告訴瀏覽器： <strong>Server 要在它身上註冊一個 cookie 變數，這個變數會在下次瀏覽器連到同一個網站時，被送到 Server 上。</strong>

所以第一次我們傾印 `$_COOKIE` 這個超全域陣列時是抓不到值的 (注意這個動作是在 Server 端) ，因為這時瀏覽器才剛認識 `setcookie` 丟出來的 test 變數。

當第二次瀏覽同一個網站時，瀏覽器就會把記在自己身上的 cookie 丟回 Server (就像 POST 一樣) ，這時 Server (PHP) 才會知道 cookie 的內容，將它塞到 `$_COOKIE` 陣列裡。

雖然這只是個小觀念，但希望能對大家在使用 Cookie 有進一步的瞭解。