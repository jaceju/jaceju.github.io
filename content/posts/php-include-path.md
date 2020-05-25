---
title: '[五分鐘教室] PHP 檔案引入路徑問題'
date: 2009-12-12 00:00:00 +08:00
tags: ["PHP"]
---

相信大家都知道， PHP 提供了幾個敘述句來協助我們引入外部檔案：

* [include](http://www.php.net/manual/en/function.include.php)
* [include_once](http://www.php.net/manual/en/function.include-once.php)
* [require](http://www.php.net/manual/en/function.require.php)
* [require_once](http://www.php.net/manual/en/function.require-once.php)

那麼它們是怎麼決定引入檔案的路徑呢？

<!-- more -->

## 絕對路徑

絕對路徑就是指檔案在作業系統中所存放的路徑，例如：

```
/var/lib/php/library/Zend/Loader.php (在 Unix like 環境)
D:\php\library\PEAR.php (在 Windows 環境)
```

所以我們可以在 include 及 require 裡直接引入這樣的檔案：

```php
require_once '/var/lib/php/library/Zend/Loader.php';
include 'D:\php\library\PEAR.php';
```

## 相對路徑

相對路徑看起來比較麻煩一點，這裡也常常是 PHP 開發者一開始容易搞混的地方。

不過只要掌握住幾個重點，那麼引入相對路徑的檔案其實也沒有想像中那麼困難。

### 相對於目前檔案所在路徑

在 PHP 預設的環境設定下，我們可以引用相對於目前這支程式的其他檔案，例如我們有一支程式 `D:\WEB\wwwroot\index.php` ，其內容如下：

```php
require 'library/Zend/Loader.php';
```

那麼 require 實際引入的檔案就會是 `D:\WEB\wwwroot\library\Zend\Loader.php` 。

不過為了確保程式不會因為環境的改變而無法正確引入檔案 (稍後會提到怎麼改變) ，我們還可以用以下方式來確保引入的檔案確實是 `D:\WEB\wwwroot\library\Zend\Loader.php` 這支程式：

```php
require dirname(__FILE__) . '/library/Zend/Loader.php';
```

從上面的例子可以看出，我們利用 `dirname(__FILE__)` 來取得目前檔案的實際所在資料夾的完整路徑 (也就是 `D:\WEB\wwwroot` ) ，然後再引入相對於這個檔案的 `/library/Zend/Loader.php` 。

### 相對於 include_path 所設定的路徑

前面我們提到 include 和 require 預設可以引入相對於目前檔案路徑的程式，其實這是定義在 `php.ini` 裡的 `include_path` 這個設定值：

```ini
; UNIX: "/path1:/path2"
;include_path = ".:/php/includes"
;
; Windows: "\path1;\path2"
include_path = ".;c:\php\includes"
```

可以發現 php.ini 會把「 `.` 」 (也就是當前目錄) 做為預設的引入路徑。而在「 `.` 」這個路徑後面，我們也可以加入自訂的引入位置，像是 `"c:\php\include"` 等等。

註：目錄前的分隔符號，在 Unix 和 Windows 是不同的 (分別是「 `:` (冒號) 」及「 `;` (分號) 」) 。在 PHP 程式裡，我們可以用 `PATH_SEPARATOR` 這個預定義常數來表示。

因此如果在程式裡不指定前面的路徑位置時， PHP 程式就會依照 `include_path` 所設定的路徑一一去尋找符合的檔案 (有找到就不會再往下找了) 。

例如我們的 include_path 內容為：

```ini
include_path = ".;c:\php5\PEAR;c:\php5\library"
```

那麼如果我們在 `D:\WEB\wwwroot\index.php` 引入：

```php
require 'Zend/Loader.php';
```

那麼 PHP 就會依照以下順序尋找 `Zend/Loader.php` ：

* `D:\WEB\wwwroot\Zend\Loader.php`
* `c:\php5\PEAR\Zend\Loader.php`
* `c:\php5\library\Zend\Loader.php`

### include_path 的順序很重要

從上面的例子可以看到 PHP 會針對 `include_path` 所設定的順序去尋找檔案，所以 `include_path` 設定的路徑會決定 PHP 找到要載入檔案的機會。

不過這樣一來也會浮現一個問題：如果要載入的檔案路徑一直都是在 `include_path` 的最後一項時，那麼會因為尋找時間過久，導致程式效率變差。

這種狀況通常發生在要載入很多類別檔案的時候，尤其是目前時下流行的 MVC 框架。

所以很多框架都會在程式一開始執行時，去調整 `include_path` 的引入路徑，把框架常用的類別庫路徑放在 `include_path` 的第一個；而為了不影響其他程式的執行，最後還是會把當前目錄 (也就是「 . 」) 放在 `include_path` 的最後一項。

## 結論

include 及 require 引入路徑一直都是開發 PHP 時很重要的觀念，不過只要掌握上述的重點後，其實它們也不是這麼難以瞭解。

總之，兩個重點：要不就是用絕對路徑 (善用 `dirname` ) ，要不就是確定 `include_path` 所設定的路徑。你就一定能找到你要引入的檔案！

就是這麼簡單！
