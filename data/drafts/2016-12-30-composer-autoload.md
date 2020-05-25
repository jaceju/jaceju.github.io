title: Composer Autoload 機制的雷
date: 2016-12-30 11:44:46
tags:
---

Autoload 機制大概是現代 PHP 最棒的發明之一，它避開了許多 `require` 的限制與陷阱，讓 PHP 開發者可以更輕鬆的處理相依類別或相依的檔案。不過 PHP 預設並沒有提供 autoload 的實作，這讓很多 PHP 開發者傷透了腦筋；然而 Composer 的出現則解決了這個問題，讓多數的 PHP 開發者不需要擔心如何實作 autoload ，只要將 Composer 提供的 autoloader 載入後，就可以享受 autoload 帶來的好處。

<!-- more -->

所以在絕大多數狀況下，你只需要在程式一開始的地方，加入以下這行：

```php
require __DIR__ . '/vendor/autoload.php'; // 視 vendor 位置而定
```

不過要注意的是， Composer 的 autoload 只會管理到 `composer.json` 中有在 `require` / `require-dev` 設定中註冊的套件或在 `autoload` 設定中有定義的部份；如果有其他套件沒有被 `composer.json` 控管，而是實作了自己的 autoload 機制時，就會需要再引用它們自訂的 autoload 檔案。

PHP 本身的機制是先註冊的先贏，composer 則相反。

composer 有把 PHP 預設的行為改變。

可以在 config 中用 prepend-autoloader: false 來調整。

https://getcomposer.org/doc/06-config.md#prepend-autoloader

原理：

PHP 的 autoload 內部用一個 list 存，spl_autoload_functions() 可以看到清單。

而 spl_autoload_register 的第三個參數 prepend 控制其為 prepend 或 append ，預設為 false ，但 composer 預設將它設為 true 。


