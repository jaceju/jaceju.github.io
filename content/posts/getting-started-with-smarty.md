---
title: 'Smarty 入門'
date: 2005-06-08T00:00:00+08:00
tags:
  - PHP
---

這是我一年前寫的文章，之前寄放在朋友的站：[[PHP 5知識交換中心]](http://www.php5.idv.tw/)。

不過因為有針對舊有的內容做一些小調整，所以這次把它放回到自己的 Blog 裡。

## 序言

剛開始接觸樣版引擎的 PHP 設計師，聽到 Smarty 時，都會覺得很難。其實筆者也不例外，碰都不敢碰一下。但是後來在剖析 XOOPS 的程式架構時，開始發現 Smarty 其實並不難。只要將 Smarty 基礎功練好，在一般應用上就已經相當足夠了。當然基礎能打好，後面的進階應用也就不用怕了。

這次的更新，主要加上了一些概念性的東西，當然也有一些進階的技巧。不過這些也許早已深入大家的程式之中，如果有更好的觀點，也歡迎大家能夠回饋。文章中的程式架構僅供參考，並不是最好的作法。不過如果剛學習Smarty，倒是可以先以這樣的寫法為基礎。

jaceju@gmail 2005/03/12

## Smarty 介紹

### 什麼是樣版引擎

不知道從什麼時候開始，有人開始對 HTML 內嵌入 Server Script 覺得不太滿意。然而不論是微軟的 ASP 或是開放源碼的 PHP，都是屬於內嵌 Server Script 的網頁伺服端語言。因此也就有人想到，如果能把程式應用邏輯 (或稱商業應用邏輯) 與網頁呈現 (Layout) 邏輯分離的話，是不是會比較好呢？

其實這個問題早就存在已久，從互動式網頁開始風行時，不論是 ASP 或是 PHP 的使用者都是身兼程式開發者與視覺設計師兩種身份。可是通常這些使用者不是程式強就是美工強，如果要兩者同時兼顧，那可得死掉不少腦細胞...

所以樣版引擎就應運而生啦！樣版引擎的目的，就是要達到上述提到的邏輯分離的功能。它能讓程式開發者專注於資料的控制或是功能的達成；而視覺設計師則可專注於網頁排版，讓網頁看起來更具有專業感！因此樣版引擎很適合公司的網站開發團隊使用，使每個人都能發揮其專長！

就筆者接觸過的樣版引擎來說，依資料呈現方式大概分成：需搭配程式處理的樣版引擎和完全由樣版本身自行決定的樣版引擎兩種形式。

在需搭配程式處理的樣版引擎中，程式開發者必須要負責變數的呈現邏輯，也就是說他必須把變數的內容在輸出到樣版前先處理好，才能做 assign 的工作。換句話說，程式開發者還是得多寫一些程式來決定變數呈現的風貌。而完全由樣版本身自行決定的樣版引擎，它允許變數直接 assign 到樣版中，讓視覺設計師在設計樣版時再決定變數要如何呈現。因此它就可能會有另一套屬於自己的樣版程式語法 (如 Smarty) ，以方便控制變數的呈現。但這樣一來，視覺設計師也得學習如何使用樣版語言。

### 樣版引擎的運作原理

首先我們先看看以下的運作圖：

![test](/resources/smarty_basic/1-01.gif)

一般的樣版引擎 (如 PHPLib) 都是在建立樣版物件時取得要解析的樣版，然後把變數套入後，透過 parse() 這個方法來解析樣版，最後再將網頁輸出。

![test](/resources/smarty_basic/1-02.gif)

對 Smarty 的使用者來說，**程式裡也不需要做任何 parse 的動作了**，這些 Smarty 自動會幫我們做。而且已經編譯過的網頁，如果樣版沒有變動的話， Smarty 就自動跳過編譯的動作，直接執行編譯過的網頁，以節省編譯的時間。

### 使用 Smarty 的一些概念

在一般樣版引擎中，我們常看到區域的觀念，所謂區塊大概都會長成這樣：

```php
<!-- START : Block name -->
區域內容
<!-- END : Block name -->
```

這些區塊大部份都會在 PHP 程式中以 `if` 或 `for`, `while` 來控制它們的顯示狀態，雖然樣版看起來簡潔多了，但只要一換了顯示方式不同的樣版， PHP 程式勢必要再改一次！

**在 Smarty 中，一切以變數為主，所有的呈現邏輯都讓樣版自行控制。**因為 Smarty 會有自己的樣版語言，所以不管是區塊是否要顯示還是要重覆，都是用 Smarty 的樣版語法 (if, foreach, section) 搭配變數內容作呈現。這樣一來感覺上好像樣版變得有點複雜，但好處是只要規劃得當， PHP 程式一行都不必改。

由上面的說明，我們可以知道使用 Smarty 要掌握一個原則：將程式應用邏輯與網頁呈現邏輯明確地分離。就是說 PHP 程式裡不要有太多的 HTML 碼。程式中只要決定好那些變數要塞到樣版裡，讓樣版自己決定該如何呈現這些變數 (甚至不呈現也行) 。

## Smarty 的基礎

### 安裝 Smarty

首先，我們先決定程式放置的位置。

* Windows下可能會類似這樣的位置： `d:\appserv\web\demo\` 。
* Linux下可能會類似這樣的位置： `/home/jaceju/public_html/` 。


接著在程式主資料夾下建立一個 `library` 資料夾，這是我們用來放置 Smarty 套件的地方。

然後我們到 Smarty 的官方網站下載最新的 Smarty 套件： [http://smarty.php.net](http://smarty.php.net)。

 解開 Smarty 2.6.0 後，會看到很多檔案，其中有個 libs 資料夾。在 libs 中應該會有 3 個 `class.php` 檔 + 1 個 `debug.tpl` + 1 個 `plugin` 資料夾 + 1 個 `core` 資料夾。**然後直接將 `libs` 複製到剛剛建立的 `library` 資料夾下，再更名為 Smarty 就可以了。**就這樣？沒錯！這種安裝法比較簡單，適合一般沒有自己主機的使用者。

至於 Smarty 官方手冊中為什麼要介紹一些比較複雜的安裝方式呢？基本上依照官方的方式安裝，可以只在主機安裝一次，然後提供給該主機下所有設計者開發不同程式時直接引用，而不會重覆安裝太多的 Smarty 複本。而筆者所提供的方式則是適合要把程式帶過來移過去的程式開發者使用，這樣不用煩惱主機有沒有安裝 Smarty 。

### 程式的資料夾設定

以筆者在Windows安裝Appserv為例，程式的主資料夾是 `d:\appserv\web\demo\` 。安裝好 Smarty 後，我們在主資料夾下再建立這樣的資料夾：

![test](/resources/smarty_basic/2-01.gif)

**在 Linux 底下，請記得將 `templates_c` 的權限變更為 `777 `。** Windows 下則將其唯讀取消。

### 第一個用 Smarty 寫的小程式

我們先設定 Smarty 的路徑，請將以下這個檔案命名為 `main.php` ，並放置到主資料夾下：

**main.php**

```php
<?php
include "library/Smarty/Smarty.class.php";
define('APP_PATH', str_replace('\\', '/', dirname(__FILE__)));
$tpl = new Smarty();
$tpl->template_dir = APP_PATH . "/templates/";
$tpl->compile_dir = APP_PATH . "/templates_c/";
$tpl->config_dir = APP_PATH . "/configs/";
$tpl->cache_dir = APP_PATH . "/cache/";
```

照上面方式設定的用意在於，程式如果要移植到其他地方，只要改 `APP_PATH` 就可以啦。 (這裡是參考 XOOPS 的 )

Smarty 的樣版路徑設定好後，程式會依照這個路徑來抓所有樣版的相對位置 (範例中是 `d:/appserv/web/demo/templates/` ) 。然後我們用 `display()` 這個 Smarty 方法來顯示我們的樣版。

接下來我們在 `templates` 資料夾下放置一個 `test.htm` ： (副檔名叫什麼都無所謂，但便於視覺設計師開發，筆者都還是以 `.htm` 為主。)

**templates/test.htm**

```html
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>{$title}</title>
</head>
<body>
{$content}
</body>
</html>
```

現在我們要將上面的樣版顯示出來，並將網頁標題 (`$title`) 與內容 (`$content`) 更換，請將以下檔案內容命名為 `test.php` ，並放置在主資料夾下：

**test.php**

```php
<?php
require "main.php";
$tpl->assign("title", "測試用的網頁標題");
$tpl->assign("content", "測試用的網頁內容");
// 上面兩行也可以用這行代替
// $tpl->assign(array("title" => "測試用的網頁標題", "content" => "測試用的網頁內容"));
$tpl->display('test.htm');
```

請打開瀏覽器，輸入 `http://localhost/demo/test.php` 試試看(依您的環境決定網址)，應該會看到以下的畫面：

![test](/resources/smarty_basic/2-02.gif)

再到 `templates_c` 底下，我們會看到其中有一個奇怪的檔案：

**%%6B^6B2^6B2BF9A3%%test.htm.php**

```php
<?php /* Smarty version 2.6.14, created on 2007-08-11 14:10:33
compiled from test.htm */ ?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title><?php echo $this->_tpl_vars['title']; ?>
</title>
</head>
<body>
<?php echo $this->_tpl_vars['content']; ?>
</body>
</html>
```

沒錯，這就是 Smarty 編譯過的檔案。它將我們在樣版中的變數轉換成了 PHP 的語法來執行，下次再讀取同樣的內容時， Smarty 就會直接抓取這個檔案來執行了。

最後我們整理一下整個 Smarty 程式撰寫步驟：

* 載入 Smarty 樣版引擎。
* 建立 Smarty 物件。
* 設定 Smarty 物件的參數。
* 在程式中處理變數後，再用 Smarty 的 `assign` 方法將變數置入樣版裡。
* 利用 Smarty 的 `display` 方法將網頁秀出。


### 如何安排你的程式架構

上面我們看到除了 Smarty 所需要的資料夾外 (`library` 、  `templates` 、 `templates_c`) ，還有兩個資料夾： `configs` 、 `modules` 。其實這是筆者模仿 XOOPS 的架構所建立出來的，因為 XOOPS 是筆者所接觸到的程式中，少數使用 Smarty 樣版引擎的架站程式。所謂西瓜偎大邊，筆者這樣的程式架構雖沒有 XOOPS 的百分之一強，但至少給人看時還有 XOOPS 撐腰。

- `configs` 資料夾一般都是用來存放設定檔的，當然也可以用放存放 Smarty 會用到的 config 設定。

- `modules` 這個資料夾則是用來放置程式模組的，如此一來便不會把程式丟得到處都是，整體架構一目瞭然。

上面我們也提到 `main.php` ，這是整個程式的主要核心，不論是常數定義、外部程式載入、共用變數建立等，都是在這裡開始的。所以之後的模組都只要將這個檔案包含進來就可以啦。因此在程式流程規劃期間，就必須好好構思 `main.php` 中應該要放那些東西；當然利用 `include` 或 `require` 指令，把每個環節清楚分離是再好不過了。

![test](/resources/smarty_basic/2-03.gif)

在上節提到的 Smarty 程式 5 步驟， `main.php` 就會幫我們先將前 3 個步驟做好，後面的模組程式只要做後面兩個步驟就可以了。

## 從變數開始

### 如何使用變數

從上一章範例中，我們可以清楚地看到我們利用 **`{`** 及 **`}`** 這兩個標示符號 (delimiter) 將變數包起來，這是 Smarty 預設的標示符號。變數的命名方式和 PHP 的變數命名方式是一模一樣的，前面也有個 `$` 字號 (這和一般的樣版引擎不同)。標示符號就有點像是 PHP 中的 `<?php` 及 `?>` (事實上它們在大部份的解析過程中，的確會被替換成這個符號) ，所以以下的樣版變數寫法都是可行的：

* 一般的寫法：

```php
 {$var}
```

* 與變數中間留有空白：

```php
{ $var }
```

* 啟始的標示符號和結束的標示符號不在同一行

```php
{$var
}
```

註：有時為了中文衝碼及 JavaScript 的關係，我們透過 `$left_delimiter` 和 `$right_delimiter` 兩個 Smarty 類別屬性，來將標示符號換掉。

在 Smarty 裡，**變數預設是全域的**，也就是說你只要指定一次就好了。**指定兩次以上的話，變數內容會以最後指定的為主。**就算我們在主樣版中載入了外部的子樣版，子樣版中同樣的變數一樣也會被替代，這樣我們就不用再針對子樣版再做一次解析的動作。

如果想要顯示的資料已經放在一個陣列裡了，是否要將裡面的變數分離出來，再做 assign 的動作呢？其實不需要！我們可以直接就把這個陣列 assign 到樣版物件中，如下：

```php
<?php
$this_user = array("fullname" => "Jace Ju", "phone" => "012345678", "email" => "jaceju@seed.net.tw");
$tpl->assign("this_user", $this_user);
```

然後在樣版中這裡使用：

```php
{$this_user.fullname}
{$this_user.phone}
{$this_user.email}
```

如此一來就不需將陣列分離， PHP 程式裡也不會有一大堆的 assign 了。

另外我們也可以把「物件」 assign 到 Smarty 裡，例如：

```php
<?php
$obj = new SomeObject();
$tpl->assign("obj", $obj);
```

而在樣版中也是與 PHP 一樣使用「 -> 」來存取該物件的屬性與方法。

```php
{$obj->fullname}
{$obj->method1()}
```

### 修飾你的變數

上面我們提到 Smarty 變數呈現的風貌是由樣版自行決定的，所以 Smarty 提供了許多修飾變數的函式。使用的方法如下：

```php
{變數|修飾函式} <!-- 當修飾函式沒有參數時 -->
{變數|修飾函式:"參數(非必要，視函式而定)"} <!-- 當修飾函式有參數時 -->
```

範例如下：

```php
{$var|nl2br} <!-- 將變數中的換行字元換成 <br /> -->
{$var|string_format:"%02d"} <!-- 將變數格式化 -->
```

好，那為什麼要讓樣版自行決定變數呈現的風貌？先看看底下的 HTML ，這是某個購物車結帳的部份畫面。

```php
<input name="total" type="hidden" value="21000" />
總金額：21,000 元
```

一般樣版引擎的樣版可能會這樣寫：

```php
<input name="total" type="hidden" value="{total}" />
總金額：{format_total} 元
```

它們的 PHP 程式中要這樣寫：

```php
<?php
$total = 21000;
$tpl->assign("total", $total);
$tpl->assign("format_total", number_format($total));
```

而 Smarty 的樣版就可以這樣寫：

```php
<input name="total" type="hidden" value=" {$total} " />
總金額： {$total|number_format:""} 元
```

Smarty 的 PHP 程式中只要這樣寫：

```php
<?php
$total = 21000;
$tpl->assign("total", $total);
```

所以在 Smarty 中我們只要指定一次變數，剩下的交給樣版自行決定即可。這樣瞭解了嗎？這就是讓樣版自行決定變數呈現風貌的好處！

## 控制樣版的內容

### 重覆的區塊

上面筆者提到，針對單一的一階陣列，我們可以直接將它 assign 到樣版上；但如果我們想將資料庫所選取出來的多筆資料一次顯示到樣版上時，勢必要透過迴圈將資料傾印出來。在樣版裡，我們可以利用重覆的區塊來完成這樣的動作。

在 Smarty 樣板中，我們要重覆一個區塊有兩種方式： `foreach` 及 `section` 。而在程式中我們則要 assign 一個陣列，這個陣列中可以包含數組陣列。就像下面這個例子：

首先我們來看 PHP 程式是如何寫的：

**test2.php**

```php
<?php
require "main.php";
$array1 = array(1 => "蘋果", 2 => "鳳梨", 3 => "香蕉", 4 => "芭樂");
$tpl->assign("array1", $array1);
$array2 = array(
    array("index1" => "data1-1", "index2" => "data1-2", "index3" => "data1-3"),
    array("index1" => "data2-1", "index2" => "data2-2", "index3" => "data2-3"),
    array("index1" => "data3-1", "index2" => "data3-2", "index3" => "data3-3"),
    array("index1" => "data4-1", "index2" => "data4-2", "index3" => "data4-3"),
    array("index1" => "data5-1", "index2" => "data5-2", "index3" => "data5-3"));
$tpl->assign("array2", $array2);
$tpl->display("test2.htm");
```

而樣版的寫法如下：

**templates/test2.htm**

```html
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>測試重覆區塊</title>
</head>
<body>
<pre>
直接呈現 array1
{$array1.1}
{$array1.2}
{$array1.3}
{$array1.4}
利用 foreach 來呈現 array1
{foreach item=item1 from=$array1}
{$item1}
{/foreach}
利用 section 來呈現 array1
{section name=sec1 loop=$array1}
{$array1[sec1]}
{/section}
利用 foreach 來呈現 array2
{foreach item=index2 from=$array2}
{foreach key=key2 item=item2 from=$index2}
{$key2} : {$item2}
{/foreach}
{/foreach}
利用 section 來呈現 array2
{section name=sec2 loop=$array2}
index1: {$array2[sec2].index1}
index2: {$array2[sec2].index2}
index3: {$array2[sec2].index3}
{/section}
</pre>
</body>
</html>
```

執行上例後，我們發現不管是 `foreach` 或 `section` 兩個執行結果是一樣的。那麼兩者到底有何不同呢？

第一個差別很明顯，就是 `foreach` 要以巢狀處理的方式來呈現我們所 assign 的兩層陣列變數，而 `section` 則以`主陣列[迴圈名稱].子陣列索引`即可將整個陣列呈現出來。由此可知， Smarty 在樣版中的 `foreach` 和 PHP 中的 `foreach` 是一樣的；而 `section` 則是 Smarty 為了處理如上列的陣列變數所發展出來的敘述。當然 `section` 的功能還不只如此，除了下一節所談到的巢狀資料呈現外，官方手冊中也提供了好幾個 `section` 的應用範例。

**不過要注意的是，丟給 `section` 的陣列索引必須是從 0 開始的正整數，即 `0, 1, 2, 3, ...`。**

如果您的陣列索引不是從 0 開始的正整數，那麼就得改用 `foreach` 來呈現您的資料。您可以參考官方討論區中的[此篇討論](http://www.phpinsider.com/smarty-forum/viewtopic.php?t=1574)，其中探討了 `section` 和 `foreach` 的用法。

### 巢狀資料的呈現

樣版引擎裡最令人傷腦筋的大概就是巢狀資料的呈現吧，許多著名的樣版引擎都會特意強調這點，不過這對 Smarty 來說卻是小兒科。

最常見到的巢狀資料，就算論譠程式中的討論主題區吧。假設要呈現的結果如下：

```html
<table
        summary="討論區格式"
        width="200"
        border="1"
        align="center"
        cellpadding="3"
        cellspacing="0">
    <tr>
        <td colspan="2">公告區</td>
    </tr>
    <tr>
        <td width="25">&nbsp;</td>
        <td width="164">站務公告</td>
    </tr>
    <tr>
        <td colspan="2">文學專區</td>
    </tr>
    <tr>
        <td width="164" rowspan="2">&nbsp;</td>
        <td width="164">奇文共賞</td>
    </tr>
    <tr>
        <td>好書介紹</td>
    </tr>
    <tr>
        <td colspan="2">電腦專區</td>
    </tr>
    <tr>
        <td width="164" rowspan="2">&nbsp;</td>
        <td width="164">軟體討論</td>
    </tr>
    <tr>
        <td>硬體週邊</td>
    </tr>
</table>
```

程式中我們先以靜態資料為例：

**test3_1.php**

```php
<?php
require "main.php";
$forum = array(
    array("category_id" => 1, "category_name" => "公告區",
        "topic" => array(
            array("topic_id" => 1, "topic_name" => "站務公告")
        )
    ),
    array("category_id" => 2, "category_name" => "文學專區",
        "topic" => array(
            array("topic_id" => 2, "topic_name" => "好書介紹"),
            array("topic_id" => 3, "topic_name" => "奇文共賞")
        )
    ),
    array("category_id" => 3, "category_name" => "電腦專區",
        "topic" => array(
            array("topic_id" => 4, "topic_name" => "硬體週邊"),
            array("topic_id" => 5, "topic_name" => "軟體討論")
        )
    )
);
$tpl->assign("forum", $forum);
$tpl->display("test3.htm");
```

樣版的寫法如下：

**templates/test3.htm**

```html
<html>
<head>
    <title>巢狀迴圈測試</title>
</head>
<body>
    <table width="200" border="1" align="center" cellpadding="3" cellspacing="0">
    {section name=sec1 loop=$forum}
        <tr>
            <td colspan="2"> {$forum[sec1].category_name} </td>
        </tr>
        {section name=sec2 loop=$forum[sec1].topic}
        <tr>
            <td width="25">&nbsp;</td>
            <td width="164"> {$forum[sec1].topic[sec2].topic_name} </td>
        </tr>
        {/section}
    {/section}
    </table>
</body>
</html>
```

執行的結果就像筆者上面舉的例子一樣。

因此呢，在程式中我們只要想辦法把所要重覆值一層一層的塞到陣列中，再利用 `{第一層陣列[迴圈1].第二層陣列[迴圈2].第三層陣列[迴圈3]. ... .陣列索引}` 這樣的方式來顯示每一個巢狀迴圈中的值。至於用什麼方法呢？下一節使用資料庫時我們再提。

### 轉換資料庫中的資料

上面提到如何顯示巢狀迴圈，而實際上應用時我們的資料可能是從資料庫中抓取出來的，所以我們就得想辦法把資料庫的資料變成上述的多重陣列的形式。這裡筆者用 [MySQLi](http://www.php.net/manual/en/ref.mysqli.php) 來抓取資料庫中的資料，如果各位有其他自己喜好的資料庫抽象套件的話，原理也是差不多的。

我們只修改 PHP 程式，樣版還是上面那個 (這就是樣版引擎的好處~)，而且抓出來的資料就是上面的例子。

**test3_2.php**

```php
<?php
require "main.php";
// 建立資料庫連結
$mysqli = new mysqli("localhost", "username", "password", "testdb");
// 先建立第一層陣列及 SQL 指令
$category = array();
$sql1 = "SELECT category_id, category_name FROM categories";
// 抓取第一層迴圈的資料
if ($result1 = $mysqli->query($sql1)) {
    while ($item_category = $result1->fetch_assoc()) {
        // 建立第二層陣列及 SQL 指令
        $topic = array();
        $sql2 = sprintf(
            "SELECT topic_id, topic_name FROM topics WHERE category_id = '%s'",
            $item_category['category_id']
        );
        // 抓取第二層迴圈的資料
        if ($result2 = $mysqli->query($sql2)) {
            while ($item_topic = $result2->fetch_assoc()) {
                // 把抓取的資料推入第二層陣列中
                array_push($topic, $item_topic);
            }
            $result2->close();
        }
        // 把第二層陣列指定為第一層陣列所抓取的資料中的一個成員
        $item_category['topic'] = $topic;
        // 把第一層資料推入第一層陣列中
        array_push($category, $item_category);
        $result1->close();
    }
}
$mysqli->close();
$tpl->assign("forum", $category);
$tpl->display("test3.htm");
```

在資料庫抓取一筆資料後，我們得到的是一個包含該筆資料的陣列。透過 `while` 敘述及 `array_push` 函式，我們將資料庫中的資料一筆一筆塞到陣列裡。如果您只用到單層迴圈，就把第二層迴圈 (紅色的部份) 去掉即可。

### 決定內容是否顯示

要決定是否顯示內容，我們可以使用 `if` 這個語法來做選擇。例如如果使用者已經登入的話，我們的樣版就可以這樣寫：

```php
{if $is_login == true}
顯示使用者操作選單
{else}
顯示輸入帳號和密碼的表單
{/if}
```

`if` 語法一般的應用可以參照官方使用說明，所以筆者在這裡就不詳加介紹了。不過筆者發現了一個有趣的應用：常常會看到程式裡要產生這樣的一個表格： (數字代表的是資料集的順序)

```html
<table
        summary="橫向重覆表格"
        width="100"
        border="1"
        align="center"
        cellpadding="3"
        cellspacing="0">
    <tr align="center">
        <td>1</td>
        <td>2</td>
    </tr>
    <tr align="center">
        <td>3</td>
        <td>4</td>
    </tr>
    <tr align="center">
        <td>5</td>
        <td>6</td>
    </tr>
    <tr align="center">
        <td>7</td>
        <td>8</td>
    </tr>
</table>
```

這個筆者稱之為「橫向重覆表格」。它的特色和傳統的縱向重覆不同，前幾節我們看到的重覆表格都是從上而下，一列只有一筆資料。而橫向重覆表格則可以橫向地在一列中產生 n 筆資料後，再換下一列，直到整個迴圈結束。要達到這樣的功能，最簡單的方式只需要 `section` 和 `if` 搭配即可。

我們來看看下面這個例子：

**test4.php**

```php
<?php
require "main.php";
$my_array = array(
    array("value" => "0"),
    array("value" => "1"),
    array("value" => "2"),
    array("value" => "3"),
    array("value" => "4"),
    array("value" => "5"),
    array("value" => "6"),
    array("value" => "7"),
    array("value" => "8"),
    array("value" => "9")
);
$tpl->assign("my_array", $my_array);
$tpl->display('test4.htm');

```

樣版的寫法如下：

**templates/test4.htm**

```html
<html>
<head>
<title>橫向重覆表格測試</title>
</head>
<body>
<table width="500" border="1" cellspacing="0" cellpadding="3">
<tr>
{section name=sec1 loop=$my_array}
<td> {$my_array[sec1].value} </td>
{if $smarty.section.sec1.rownum is div by 2
&& $smarty.section.sec1.rownum < $smarty.section.sec1.total}
</tr>
<tr>
{/if}
{/section}
</tr>
</table>
</body>
</html>
```

重點在於 `$smarty.section.sec1.rownum` 及 `$smarty.section.sec1.total` 這兩個 Smarty 變數，在 `section` 迴圈中這個 `rownum` 變數會取得從 1 開始的 索引值，所以當 `rownum` 能被 2 除盡時，就輸出 **`</tr><tr>`** 使表格換列 (注意！是 **`</tr>`** 在前面 **`<tr>`** 在後面) ，因此數字 2 就是我們在一列中想要呈現的資料筆數。而 `total` 這個變數會回傳資料總筆數，所以讓 `rownum` 在小於 `total` 這個變數才做輸出 `</tr><tr>` 的動作，會確保不會出現最後一個空的 `<tr></tr>` 。

各位可以由此去變化其他不同的呈現方式。

### 載入外部內容

我們可以在樣版內載入 PHP 程式碼或是另一個子樣版，分別是使用 `include_php` 及 `include` 這兩個 Smarty 樣版語法； `include_php` 筆者較少用，使用方式可以查詢官方手冊，這裡不再敘述。

在使用 `include` 時，我們可以預先載入子樣版，或是動態載入子樣版。預先載入通常使用在有共同的文件標頭及版權宣告；而動態載入則可以用在統一的框架頁，而進一步達到如 Winamp 般可換 Skin 。當然這兩種我們也可以混用，視狀況而定。

我們來看看下面這個例子：

**test5.php**

```php
<?php
require "main.php";
$tpl->assign("title", "Include 測試");
$tpl->assign("content", "這是樣版 2 中的變數");
$tpl->assign("dyn_page", "test5_3.htm");
$tpl->display('test5_1.htm');
```

樣版 1 的寫法如下：

**templates/test5_1.htm**

```html
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title> {$title} </title>
</head>
<body>
{include file="test5_2.htm"}
{include file=$dyn_page}
{include file="test5_4.htm" custom_var="自訂變數的內容"}
</body>
</html>
```

樣版 2 的寫法如下：

**templates/test5_2.htm**

```php
<p>{$content}</p>
```

樣版 3 的寫法如下：

**templates/test5_3.htm**

```html
<p>這是樣版 3 的內容</p>
```

樣版 4 的寫法如下：

**templates/test5_4.htm**

```php
<p>{$custom_var}</p>
```

這裡注意幾個重點：

* 樣版的位置都是以先前定義的 `template_dir` 為基準。
* 所有 `include` 進來的子樣版中，其變數也會被解譯。
* `include` 中可以用 `變數名稱=變數內容` 來指定引含進來的樣版中所包含的變數，如同上面樣版 4 的做法。

## 範例下載

[下載](/resources/smarty_basic/example.zip)本文所有範例。

而其他 Smarty 更進階的部份，就請看筆者的拙作：「 [PHP Smarty 樣版引擎](http://www.flag.com.tw/book/5105.asp?bokno=F5471)」。
