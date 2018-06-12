---
layout: post
title: '用 Xdebug 來找出 PHP 程式錯誤'
date: 2005-12-19
wordpress_id: 61
comments: true
tags: ["PHP"]
---

有時候 PHP 在執行到某個錯誤時，只會丟出一行的訊息，告訴你程式發生錯誤。 例如以下的程式：

```php
<?php
function test($var)
{
   $var->display();
}
$abc = 123;
test($abc);
?>

```

執行後會出現以下的錯誤：

```
Fatal error:  Call to a member function display() on a non-object in D:\WEB\wwwroot\index.php on line 4

```

我們可以知道在第 4 行的地方因為 test 函式對 $var 呼叫了物件操作函式，卻因為 $var 不是物件而導致錯誤 (Fatal Error) 。但是我們怎麼知道 $var 變數是從那裡來的呢？就上例而言，很明顯地往回推到第 8 行呼叫 test 函式的地方，我們給它的是 $abc 變數，而 $abc 變數存放則是一個數值，也因此造成 test 函式的錯誤。

當然在程式碼比較短時，我們可以很容易知道整個程式執行的流程動向；不過當我們的程式碼暴漲到上百行或是中間引入不同檔案時，要一下子歸納出它的動線就很不容易了。換句話說，如果第 6 行中我們有上百行的程式碼，那麼我們如何一下子就找到 test 函式的引用點呢？

<!--more-->

## Xdebug

之前我寫了一篇 [Xdebug 的文章](http://www.jaceju.net/blog/archives/21)，不過當時談到的是簡測 PHP 程式的效能。其實 Xdebug <del>故名思意</del>[顧名思義](http://140.111.34.46/chengyu/)就是讓我們可以對程式進行除錯，同時也記錄相關的資訊。而它有個很常用的功能，就是讓我們在程式出錯時，可以知道發生錯誤前，程式所執行的流程。

例如上例在使用安裝 Xdeubg 後，所出現的錯誤畫面： (安裝方式請參考上面提到的文章)

[![程式一的錯誤畫面](//www.jaceju.net/resources/xdebug_debug/001.png)](//www.jaceju.net/resources/xdebug_debug/001.png)

其中紅色部份就是原來的錯誤訊息，而底下的表格部份就是程式執行的順序 (且已正確執行) 。所以我們能很清楚地知道程式是在第 8 行引用 test 函式後發生了錯誤，這樣一來就能減小我們搜索的範圍。

不過有種情況 Xdebug 發揮不了作用，那就是 PHP.INI 錯誤回報等級被調整過了。例如以下範例：

```php
<?php
class test
{
  private $var = '123';
  public function display()
  {
    echo $this->varr;
  }
}
function test()
{
  return new test;
}
$abc = test();
$abc->display();
?>

```

如果當你執行這段程式時，沒有出現任何錯誤，那麼就表示 PHP.INI 錯誤回報等級沒有對「變數未定義」產生警告 (&nbsp;NOTICE) 。通常這是在上線系統所必須關閉的，因為很多時候我們常會漏掉宣告這些變數 (給初始值) ；如果不關掉的話，頁面就會產生一堆讓使用者費解的訊息。

試著在 <?php 的下一行加上：

```php
error_reporting(E_ALL);

```

重新執行後我們就會看到：

[![程式二的錯誤畫面](//www.jaceju.net/resources/xdebug_debug/002.png)](//www.jaceju.net/resources/xdebug_debug/002.png)

上面的意思就是未宣告的屬性，回頭看一下類別程式，原來我們多輸入了一個 r 字母 (變成 var<strong>r</strong>) 。這種錯誤也常見於一個較大型的物件類別程式中如果有較長名稱的屬性時，我們很容易寫錯它們的名字 (尤其像英文不好的我) 。

因此如果要使用 Xdebug ，一定要記得把錯誤回報等級設定至最嚴格，這樣才能抓出所有的問題點。