---
title: '[PHP] 交換兩個變數 (不使用 tmp 變數) 程式寫法'
date: 2007-11-23T00:00:00+08:00
tags:
  - PHP
---

在宗董的 Blog 看到這篇：[交換兩個變數 (不使用 tmp 變數) 程式寫法](http://plog.longwin.com.tw/programming/2007/11/23/variable_swap_programming_2007)，本來想留言，不過宗董的 Blog 系統似乎有問題。

宗董的方法是這樣的：

```php
$a ^= $b;
$b ^= $a;
$a ^= $b;
```

我是想說既然是用 PHP 了，就應該好好善用一下 PHP 的原生語法：

```php
[$a, $b] = [$b, $a];
```

搞定~~

這個是從 [PHP 程式設計專家必備手冊](http://www.pearsoned.com.tw/chinese_show_title.asp?bkid=9867910672)一書看來的。