title: 一些有關 PHP Mockery 套件的新用法
tags:
- PHP
- 測試
---

這幾天在單純的 PHPUnit 環境下 (也就是不使用 Laravel 的測試) 測試 [Mockery](https://github.com/mockery/mockery) 套件時發現一些問題，然後才知道 Mockery 1.0 已經調整很多東西了。

而這些調整都已經寫在官方文件裡的 [Upgrading](http://docs.mockery.io/en/latest/getting_started/upgrading.html) 裡面，這邊簡單做個整理。

<!--more-->

## 為什麼 assertion 沒反應？

簡單寫個用到 Mockery 的測試，你會發現之前能動作的 assertion 都失效了：

```php

```

執行後會出現這個錯誤：

```
There was 1 risky test:

1) ExampleTest::it_is_an_example
This test did not perform any assertions
```

在 Mockery 1.0 之後，你需要在測試類別裡引用 `\Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration` 這個 trait ，或是繼承 `\Mockery\Adapter\Phpunit\MockeryTestCase` 這個類別；一般來說用 trait 比較方便，例如：

```php

```


## 測試 Closure 更簡單了

由於 Closure 的使用方式已經調整，所以我同步修改了以前寫的這篇文章：[《在 PHPUnit 中測試需要 closure 的函式》](/php-closure-testing/)。

[RFC: Callable spies](https://github.com/mockery/mockery/pull/712)
