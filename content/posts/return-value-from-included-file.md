---
title: '[PHP] PHP 密技： include 與 require'
date: 2008-02-22T00:00:00+08:00
tags:
  - PHP
---

## 可以接受回傳資料？

先調查一下，知道 include 或 require 可以取得回傳資料的請舉手... (眺望)

呃...不知道的朋友也不用煩惱，我來解釋一下。

<!-- more -->

如何回傳資料呢？假設現在有個 php 檔叫做 `config.php` ，內容如下：

```php
<?php
return array('123', '456');
```

咦？那邊有人說 `return` 放錯地方了？不不不， PHP 能接受這樣的寫法。

好，現在我們來證明 `include` 或 `require` 能取得 `config.php` 所 return 回來的資料。請建立一支 `test.php` ，其內容是：

```php
<?php
$config = require 'config.php';
var_dump($config);
```

執行看看，是不是可以跑呀？

所以我們可以在某支 PHP 程式中 return 一個資料 (任何型態) ，然後在另一支 PHP 程式中用 `include` 或 `require` 來取得這個資料。

## 把 require 放在參數裡

什麼？這不是密技？不不不，密技在底下：

```php
function test($config) {
    var_dump($config);
}
test(require 'config.php');
```

對！你沒看錯！直接把 `require` 放在函式的參數裡！

還沒完呢，再看：

```php
class Test
{
    public function __construct($config)
    {
        var_dump($config);
    }
}

$a = new Test(require 'config.php');
```

連 new 建構子的參數都可以接受 require ！

所以只要能放變數的地方，都可以放 `include` 或 `require` ，例如：

```php
if (require 'config.php') {
    var_dump(require 'config.php');
}

if ($config = require 'config.php') {
    var_dump($config);
}
```

而且不僅是 `include` 及 `require` ，連 `include_once` 和 `require_once` 都可以這麼做。

我在[某篇文章](http://blog.astrumfutura.com/archives/340-The-Zend-Framework,-Dependency-Injection-and-Zend_Di.html)發現這個密技以後，分享給辦公室裡的同事們；沒想到玩了 PHP 這麼多年的他們也沒看過這個方法，看來大家對 PHP 的瞭解需要更深入一點囉！

## Scope 的問題

接著我同事問了我一個問題：如果在參數使用 `require` 敘述，而且被 require 的 PHP 程式裡如果有定義全域變數的話，那麼這個變數在執行的 PHP 程式裡，它的 scope 在哪裡呢？

答案是：它還是全域。

怎麼說呢？現在我們在剛剛的 `config.php` 的 `return` 敘述前加上一行程式，如下：

```php
<?php
$data = '789'; // 加上這行
return array('123', '456');
```

然後在 test.php 裡的 Global 部份 (也就是不在函式或類別定義裡) 的任意處加入：

```php
var_dump($data);
```

是不是也可以正確顯示 `config.php` 中 `$data` 變數所指定的內容呢？這就表示在參數中使用 `require` 不會影響全域變數的 scope 。

還有其他 `include` 或 `require` 的密技嗎？歡迎大家一起討論囉~
