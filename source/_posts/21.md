---
layout: post
title: '簡單測試 PHP 執行的效能'
date: 2005-5-30
wordpress_id: 21
comments: true
tags: ["PHP"]
---

有時候執行某些 PHP 網頁時，都會覺得很慢，但又不曉得問題出在哪？以下介紹一個好工具，可以讓我們很容易知道我們寫的 PHP 執行瓶頸在哪裡。

[Xdebug](http://www.xdebug.org/) 是 PHP 上的一個擴充模組，它可以協助我們追蹤程式上的偵錯訊息、程式執行了哪些區段，以及其他許多有用的資訊。不過這裡我們僅會用到檢視執行效能上的功能。我示範的平台是以 Windows + Apache 2.0 為主，PHP 版本為 5.0.4 。

<!--more-->

## 安裝

首先我們到 [Xdebug 官方網站](http://www.xdebug.org/download.php) 下載最新的 Xdebug 2.1.0 (請對應你的 PHP 版本)，並將它複製到 PHP 安裝目錄 的 `ext` 子資料夾裡。

**補充：**請記得設定 `php.ini` 的 `extension_dir="c:/php5/ext/"` ；或是把 Windows 的 PATH 系統變數後面加上 `;c:\php5\ext` ，然後重新啟動電腦。

**補充：**有時候 Windows 還是不能找到 `ext` 底下的 dll 檔 (例如 PHP 5.1 就會如此) ，這時候只要把 `c:\php5\ext;` 改加在 PATH 變數之前就行了。例如：


```
c:\php5;c:\php5\ext;%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem

```

接著在 PHP.INI 中加入：


``` ini php.ini
[Xdebug] zend_extension_ts=php_xdebug.dll
xdebug.profiler_enable=on
xdebug.trace_output_dir=“C:/TEMP/php/xdebug”
xdebug.profiler_output_dir=“C:/TEMP/php/xdebug” ```

```

記得重新啟動 Apache ，否則 Xdebug 是不會動作的。

檢視 `phpinfo()` ：

![](/resources/xdebug_profile/01.gif)

出現 Xdebug 的話，就算完成了。

## 檢視執行效能

接下來，我們任意執行一個 PHP 程式，讓 Xdebug 對它做側寫 (profiling) 。然後我們到 `C:\TEMP\php\xdebug\` 這個資料夾下，就會看到數支 `cachegrind.out.xxxxxxx` 檔。用文字編輯器開啟它，裡面就是我們剛剛執行的 PHP 檔所產生的相關偵錯資訊。

不過這樣實在是不容易看懂它，我們可以借重這個工具： [WinCacheGrind](http://sourceforge.net/projects/wincachegrind) 來將這些文字檔作較好格式的輸出。一樣下載 WinCacheGrind 回來安裝，而安裝步驟很簡單，就是一直按「下一步」就可以安裝完成，這裡我就不多加描述。

安裝好後，開啟 WinCacheGrind ，我們可以看到以下畫面：

![](/resources/xdebug_profile/02.gif)

接著選擇 `Tools / Options…` ，在 `Main` 頁籤中的 `Working folder` 選擇 `C:\Temp\php\xdebug` 後，按下 `OK` 。

![](/resources/xdebug_profile/03.gif)

點兩下想查看的 `cachegrint.out` ，就會顯示出這支程式所執行過的函式、物件、以及它們的執行秒數。

![](/resources/xdebug_profile/05.gif)

如果大家有發現什麼 Xdebug 有什麼更棒的功能，歡迎分享。
