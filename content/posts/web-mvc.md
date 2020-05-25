---
title: '透視 WebMVC'
date: 2007-03-16 00:00:00 +08:00
tags: ["Web 開發"]
---

## 前言

以往我所開發的 Web 專案，大部份都是把核心放在操作 HTML ；就算後來使用了 Smarty ，卻還是迷失在視覺為重的設計觀點裡，使得後續開發與維護都變得非常麻煩。後來我自己歸納出問題發生的原因，絕大部份在於我接觸的專案常常是「畫面先行」。

「畫面先行」是由視覺設計人員來主導專案的架構，而這個架構則通常是因應客戶在網站流程上的要求而建立的；這也使得我在開發程式時就必須地採用他們決定好的頁面來套用程式，最後的結果就是導致重複的業務邏輯遍布在整個專案裡。

![以 Smarty 為核心](/resources/webmvc/images/smarty_core.png)

不過就算使用了 Smarty ，這種問題也還是沒有得到更進一步的解決。原因就在於我只是把 PHP 程式和 HTML 頁面拆開，而實際上同樣的業務邏輯卻沒有能夠包裝起來重複使用。直到我接觸了物件導向的觀念後，我才驚覺這種設計真的是不堪一擊。

於是我很認真地使用物件導向來封裝我的業務邏輯，並天真地以為讓它們能夠 reuse 後，程式的複雜度就會降低；但是逐漸地我發現到，我花在修改這些物件的時間竟然變得比以前長，我必須不斷地為它加入不同的判斷條件，好讓它應付所有可能發生的變化。可是這不是我所希望發生的結果呀！到底為什麼會變成這樣呢？

我發現很多時候我讓物件在發生錯誤時，自行丟出一個訊息給瀏覽器，或是透過 Smarty 將這些訊息包裝成畫面。但是過了幾個月之後的改版，這個物件的重用性變得越來越差，而且也變得越來越大。另外它跟 Smarty 的耦合性也太高，畢竟有時候我根本不想在這個時候使用 Smarty 丟出畫面，而是想讓上一層程式自己去決定！

後來我歸納出這一切問題的原因，都是我錯把 Smarty 當成主角 - 也就是網站架構的核心！

剛接觸 Smarty 時，我同時也耳聞了 MVC 這個設計模式。不過那時剛剛接觸物件導向，也還不瞭解什麼是設計模式；只知道使用 Smarty 的前輩們倡導大型的應用項目都應該朝向 MVC 的架構去設計。雖然我那時仍不清楚 MVC 的核心概念，然而這個開發方式卻帶給我一個很大的思考空間：為什麼要把一個應用程式分成三個部份？而在 Web 上這種開發方式也行得通嗎？在參考過一些書籍，這些問題仍似有若無的存在我的心中，所以我的程式架構依然沒有什麼改進。

直到在寫「 [PHP Smarty 樣版引擎](http://tlsj.tenlong.com.tw/WebModule/BookSearch/bookSearchViewAction.do?isbn=9574423131)」這本書時，我也剛好讀到了「[深入淺出設計模式](http://tlsj.tenlong.com.tw/WebModule/BookSearch/bookSearchViewAction.do?isbn=9867794524)」這本好書；而該書對 MVC 模式的介紹，正好解開我長年以來的疑惑。

原來真正的 MVC 是將「資料處理邏輯」、「程式流程」與「資料呈現」三者分離，而 Smarty 只是扮演了「資料呈現」的角色而已！

不過懂是懂了，但要如何將這個概念融入 Web 開發中，這點讓我覺得很頭痛。雖然發現很早就[有人](http://www.phpmvc.net/)把 MVC 帶進 PHP 裡了，只可惜用的人不多，文件也比較少。所以在我的書中的 MVC 架構用得非常簡陋，只能說是 WebMVC 的雛形而已。而這時 Ruby on Rails 剛好在網路界萌芽，號稱將 MVC 帶入了 Web 開發中；並且首開先例，用影片來示範一個 Blog 系統的誕生，所以我也不可免俗地去抓回來玩看看 (我想很多寫 Java 的人大概就是這點所吸引) 。可惜我一看到 Ruby 那個奇怪的語法，就覺得看不下去了，所以只是照本宣科地把範例作一作，最後不了了之 (後來想一想真是可惜) 。

直到又過了好一陣子，在 CakePHP 、 Code Igniter 等號稱 PHP 界的 Rails 開發框架出現後，我便興致勃勃地去下載回來研究。而參考了它們的範例後，這時我才猛然醒悟！原來 Web 上的 MVC 架構是長成這個樣子！後來為了專案需要，更把 LifeType 的程式碼追了一遍，這才發現 WebMVC 竟是如此彈性而富有變化！

由於深刻體認到物件導向所帶給我的衝擊，我不得不承認以往我所嚮往的開發方式仍然有很大的改進空間。所以我想就從架構的改進開始，讓自己重頭去認識新的 Web 開發方式。

## 傳統的程式架構

以往我所見到的程式架構，大多都是一個功能一個頁面。就拿留言板來說好了，以前的我大概會這樣規劃：

* index.php (留言列表頁)

* add.php (新增留言表單)

* do_add.php (處理新增留言)

* rss.php (假設這個留言板有提供 RSS 服務)



以上的規劃方式很明顯地是一個功能一支程式，這在小項目裡面很常見。為了探討這種架構的優缺點，以下我便採用這種方式來實作一個傳統的留言板。

註：當然也可以將它們全部放在同一支程式中處理掉，不過我還是暫時不要變得那麼「聰明」。

### 程式碼

先以 index.php 來說，以下是一個簡單的實作：

```
<?php
// 載入設定
require_once 'config.php';
// 從檔案中取得所有留言
$messages = (file_exists(APP_STORAGE))
          ? unserialize(file_get_contents(APP_STORAGE))
          : array ();
// 輸出 HTML
header('Content-Type: text/html; charset=utf-8');
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
.... (略) ....
<div id="content">
<?php if (count($messages)): ?>
<?php foreach ($messages as $id => $message): ?>
<div class="messageBlock">
<h2><?php echo $message['title']; ?></h2>
<p><?php echo nl2br($message['body']); ?></p>
<p class="messageBlockFunctions">By <?php echo $message['author']; ?></p>
</div>
<?php endforeach; ?>
<?php else: ?>
<p>沒有任何文章</p>
<?php endif; ?>
</div>
.... (略) ....
</body>
</html>

```

![PHP with HTML](/resources/webmvc/images/php_html.png)

主要在這裡我是利用文字檔來存放留言內容，然後利用程式取得留言後再將它們輸到到 HTML 。這樣的寫法把留言版的處理邏輯和 HTML 混在一起，是 PHP 常見的開發方式。

而 add.php 純粹是表單頁，這裡我把它略過。接下來是我在 do_add.php 上的實作：

```
<?php
// 載入設定
require_once 'config.php';
// 取得表單變數
$title = $_POST['title'];
$author = $_POST['author'];
$body = $_POST['body'];
// 從檔案中取得所有留言
$messages = (file_exists(APP_STORAGE))
          ? unserialize(file_get_contents(APP_STORAGE))
          : array ();
// 在所有留言的最後加上一筆
$messages[] = array (
    'id'     => count($messages) + 1,
    'title'  => $title,
    'author' => $author,
    'body'   => $body,
);
// 將所有留言寫回檔案
file_put_contents(APP_STORAGE, serialize($messages));
// 導回列表頁
header('Location: ./');

```

看起來 do_add.php 做的事多了一點，不過我想還不至於太困難。這裡的 do_add.php 沒有介面可讓使用者操作，像這樣的程式通常是為了處理表單變數而存在的。

註：以上用檔案存取留言的方式是為了簡單起見，所以寫得非常偷懶，我想不值得學習。

最後來看看 rss.php 的實作：

```
<?php
// 載入設定
require_once 'config.php';
// 從檔案中取得所有留言
$messages = (file_exists(APP_STORAGE))
          ? unserialize(file_get_contents(APP_STORAGE))
          : array ();
// 組合 XML
$xml = '';
$xml .= '<' . '?xml version="1.0" encoding="utf-8"?' . '>' . "\n";
$xml .= '<rss version="2.0">' . "\n";
$xml .= '<channel>' . "\n";
$xml .= '<title>TEST</title>' . "\n";
$xml .= '<description>TEST</description>' . "\n";
foreach ($messages as $message)
{
    $xml .= '<item>' . "\n";
    $xml .= '<title>' . $message['title'] . '</title>' . "\n";
    $xml .= '<description>' . $message['body'] . '</description>' . "\n";
    $xml .= '</item>' . "\n";
}
$xml .= '</channel>' . "\n";
$xml .= '</rss>';
// 輸出 XML
header('Content-Type: text/xml; charset=utf-8');
echo $xml;

```

這裡我遵循最簡單的規範，把留言內容輸出成可供讀取的 RSS 格式。

上面的程式其實花不到我幾分鐘，倒是 CSS 的部份用的時間長了點 (大概半小時) ，這也說明 PHP 在小型應用程式上的開發效率是很高的 (也許是因為我用了偷懶的方式 :P ) 。然而我捫心自問：如果今天沿用這樣的架構來開發大型專案的話，那麼對團隊合作會有什麼樣的影響呢？

### 面臨的問題

我先簡單把上面幾支程式拆解開來分析，便發現以下的通則：

* 如果需要的話則取得表單變數 (do_add.php) 。

* 存取資料並透過相關邏輯處理 (index.php 、 rss.php 、 do_add.php) 。

* 輸出資訊給瀏覽器或其他外部程式 (index.php 、 rss.php 、 add.php) 。



註：雖然 do_add.php 的 header('Location') 指令也是會傳送 HTTP 的 Header 資訊給瀏覽器，但是我把它視為流程控制而非資料呈現。

我手邊在維護的大部份 PHP 程式都是以類似的流程所寫成的，當然這樣寫是非常直覺的。但是就拿上面留言板的例子來說好了，我就發現這樣的架構會帶來以下幾個主要的缺點：

* 如果我想將文字檔換成正式的資料庫系統時，我得同時更改三支程式檔。
* 如果在多人開發環境下，程式開發沒辦法和視覺設計並行；如果頁面風格要更改的話可能會更慘。
* 重複的程式碼太多 (例如讀取資料部份) ，一旦發現錯誤，必須把所有相關的程式找出來一個一個修改。


雖然在留言板這種小項目中，以上的問題並不會影響太大；可是我所維護或開發的應用程式通常都會包含數十支甚至上百支的頁面，這時候上面的問題就會隨著頁面數量而呈現等比級數的成長。

我曾在「 [PHP Smarty 樣版引擎](http://tlsj.tenlong.com.tw/WebModule/BookSearch/bookSearchViewAction.do?isbn=9574423131)」提過，網站開發上絕對不是只有一個人的事情；除了專案企劃人員的參與外，程式開發人員及視覺設計人員之間的協調更是重要。如果一個架構不能同時讓這兩方人馬有良好的互動，那麼這個架構就不值得團隊採用。

當然我可以在這裡導入樣版引擎 (例如 Smarty ) ，然而這樣依舊無法有效解決後續維護上的問題；而且我先前也過於依賴以樣版引擎為主幹的開發方式，而沒有認真去思考如何把相似的部份整合在一起。因此若是要一次解決以上的問題，我便得好好思考如何真正有效去切割並重組這樣的程式架構。

## 轉換思考模式

在前面的程式裡面，除了 PHP 和 HTML 看起來是還算有明顯的區隔，其他部份其實還滿不容易看出它們之間的關係。在遇到這樣的問題時，我個人非常喜歡使用圖形化的思考模式，這會有助於對程式整體架構的分析，所以我便把以上四支程式所做的事情圖形化。在圖形化之後，我發現每支程式中都有相關的部份；因此我就把相關的功能對齊，如下圖所示：

![傳統架構](/resources/webmvc/images/transition.png)

現在整個程式架構相當清楚了，像是讀取留言或新增留言都是留言板的核心功能，已經對齊在同一個水平上；而輸出資訊的部份也是一樣，不論輸出格式是 HTML 還是 RSS ，都可以一視同仁。然而比較特別的是，我決定把頁面流程也看成是相類似的功能集合，換句話說就是淺藍色的部份也算是相關的。

接著我把這些重複或相似的部份沿著虛線將它們切割開來並重新群組在一起：

![轉換成MVC](/resources/webmvc/images/group.png)

現在我有留言板的核心部份 (也就是取得所有留言以及新增留言) 、兩種輸出的形態 (HTML 與 RSS ) 以及相關的頁面動作 (index 、 add 、 do_add 、 rss) 三個群組，看起來好像很棒，但是有什麼用呢？

回想一下前面的問題，首先我遇到了資料庫會改變這個事實，不過看來我只需要把 Guestbook 這個群組的實作方式抽換掉就可以解決。當然抽換的過程中也不會影響到其他兩個群組的運作，因為我已經將留言板的核心部份排除在頁面之外了。換句話說，不論我的留言訊息是以檔案存放或是使用資料庫存放，只要 Guestbook 群組提供相同的操作介面，都能讓其他程式要更動的部份減至最少。

而第二個問題我可以在 Output 群組中找到解答，因為這裡我只需要導入樣版的概念，那麼 HTML 或是 RSS 都可以獨立在程式之外。而且 HTML 的部份我可以搭配 Smarty 或其他樣版引擎，也可以使用單純的 PHP 套版；而 RSS 的部份除了上面直接使用字串來輸出的方式外，我也可以改用其他方便的第三方類別庫來協助產生。這樣一來不僅解決協同開發的問題，還能夠讓專案選用適當的方法來產生輸出。

最後我再把頁面的流程放在 Actions 群組裡，也就是說我可以把重複的部份提煉出來放在一起。而這樣的調整就能使我在增加新功能或是修正某些錯誤時，能夠避免相關的程式碼重複；而且也能將相關功能放在同一個群組下以便管理。

### 程式碼

上面的理論雖然感覺起來很棒，但是還缺少實務的支持，所以我必須把這些群組變成程式碼。不過在實務上，「群組」並不是真正能夠實作的東西，所以我想這時就應該引進物件導向的觀念了。因為前面我把相類似的功能放在一起，所以它們就能形成一個物件導向中的類別。換句話說 Guestbook 是一個類別，而 Output 和 Actions 也是一樣，所以在新的架構裡我就可以使用類別來實作程式。然而事實上我只是先把舊的程式碼按照上面的邏輯重新組合在類別代碼裡，並求能正常執行。

註：事實上並非將相似功能放在一起就能夠轉換成類別，我個人只是為了簡化思考，才會採用這樣的概念。

首先是 Guestbook.php ，它的類別代碼如下：

```
<?php
// 留言版類別
class Guestbook
{
    // 留言
    private $messages;
    // 建構函式
    // 預先從檔案中取得所有留言
    public function __construct()
    {
        $this->messages = (file_exists(APP_STORAGE))
                        ? unserialize(file_get_contents(APP_STORAGE))
                        : array ();
    }
    // 取得所有留言
    public function getAllMessages()
    {
        return $this->messages;
    }

    // 新增留言
    // 在所有留言的最後加上一筆後寫回檔案
    public function addMessage($title, $author, $body)
    {
        $this->messages[] = array (
            'id'     => count($this->messages) + 1,
            'title'  => $title,
            'author' => $author,
            'body'   => $body,
        );
        file_put_contents(APP_STORAGE, serialize($this->messages));
    }
    // 解構函式
    public function __destruct()
    {
        $this->messages = NULL;
    }
}

```

在 Guestbook 類別裡，我把讀取留言 (getAllMessages) 和新增留言 (addMessage) 的程式變成類別方法，在實作上還是採用原來檔案存取的方式。在這裡 getAllMessages 和 addMessage 兩個方法，就是供外部呼叫用的統一介面。如果之後如果我需要更換成資料庫，那麼就可以只更改這些方法的實作即可。

接下來是 Output.php ，它的類別代碼如下：

```
<?php
// 輸出類別
class Output
{
    // 輸出類型
    private $type;
    // 樣版變數
	private $vars = array ();
    // 建構函式
    public function __construct($type)
    {
        $this->type = in_array($type, array('HTML', 'RSS'))
                    ? $type
                    : 'HTML';
    }
    // 設定樣版變數
    // 這裡不用 __set 是因為我不想在 PHP 程式裡直接對物件指定屬性
    public function setVar($tpl_var, $value = null)
    {
        if (is_array($tpl_var))
        {
            foreach ($tpl_var as $key => $val)
            {
                if ($key != '')
                {
                    $this->vars[$key] = $val;
                }
            }
        }
        else
        {
            if ($tpl_var != '')
            {
                $this->vars[$tpl_var] = $value;
            }
        }
    }
    // 自動取得對應的樣版變數
    // 在樣版裡直接取得變數會比較方便
	private function __get($name)
	{
		return isset($this->vars[$name]) ? $this->vars[$name] : NULL;
	}
    // 依照類型輸出結果
    // 輸出前先用 header 函式讓瀏覽器得知正確的輸出型態與編碼
    public function render($template_file = '')
    {
        if ('HTML' == $this->type)
        {
            // 輸出 HTML
            header('Content-Type: text/html; charset=utf-8');
            echo $this->fetchHTML('templates/' . $template_file);
        }
        else
        {
            // 輸出 RSS
            header('Content-Type: text/xml; charset=utf-8');
            echo $this->fetchRSS();
        }
    }
    // 擷取 HTML 結果
    // 透過 Output Buffer 來擷取結果，這樣方便視覺套版
    private function fetchHTML($template_file)
    {
        $html = '';
        ob_start();
        include $template_file;
        $html = ob_get_contents();
        ob_end_clean();
        return $html;
    }

    // 擷取 RSS 結果
    // 因為 RSS 格式固定，所以直接使用字串串接
    private function fetchRSS()
    {
        $xml = '';
        $xml .= '<' . '?xml version="1.0" encoding="utf-8"?' . '>' . "\n";
        $xml .= '<rss version="2.0">';
        $xml .= '<channel>';
        $xml .= '<title>TEST</title>';
        $xml .= '<description>TEST</description>';
        foreach ($this->items as $item)
        {
            $xml .= '<item>';
            $xml .= '<title>' . $item['title'] . '</title>';
            $xml .= '<description>' . $item['body'] . '</description>';
            $xml .= '</item>';
        }
        $xml .= '</channel>';
        $xml .= '</rss>';
        return $xml;
    }
}

```

我讓 Output 負責 HTML 和 RSS 兩種型態的輸出，並在建立物件時就決定輸出的型態。在 Output 類別裡的 HTML 輸出部份採用了樣版的概念，也就是取得 HTML 樣版並代入相關的變數，最後才取得代入後的結果。而 HTML 樣版自己會決定要輸出什麼，我只需要呼叫正確的樣版即可。不過值得注意的是 HTML 樣版的樣版變數，因為我在 Output 類別裡使用了 setVar() 方法來指定樣版變數，而以 __get() 這個魔術方法來取得變數內容；因此以列表頁的 HTML 樣版 (index.tpl.htm) 為例，原來的 $messages 就會變成 Output 物件的屬性，因此要將 $messages 改寫為 $this->messages ：

```
<?php if (count($this->messages)): ?>
<?php foreach ($this->messages as $id => $message): ?>
<div class="messageBlock">
<h2><?php echo $message['title']; ?></h2>
<p><?php echo nl2br($message['body']); ?></p>
<p class="messageBlockFunctions">By <?php echo $message['author']; ?></p>

```

而 RSS 輸出的部份，我則是把原來的程式用類別方法包裝起來，當然 $items 也要改成 $this->items 。

以上的動作會由 fetchHTML 、 fetchRSS 及 render 三個方法來幫我完成；我只要在建立物件時指定好要輸出的型態， render 函式就會自行決定要呼叫 fetchHTML 還是 fetchRSS 。

然後是 Actions.php ，它的類別代碼如下：

```
<?php
// 動作類別
class Actions
{
    // 共用的留言版物件
    private $guestbook = NULL;
    // 使用者選擇的動作
    private $action = 'index';
    // 建構函式
    // 初始化要執行的動作以及留言板物件
    public function __construct()
    {
        $this->action = isset($_GET['act'])
                      ? strtolower($_GET['act'])
                      : 'index';
        $this->guestbook = new GuestBook;
    }
    // 執行選擇的動作
    public final function run()
    {
        $this->{$this->action}();
    }
    // 重新導向
    // 借用 header 函式來導向指定的網址
    private function redirectTo($url)
    {
        header('Location: ' . $url);
    }
    // 預設的列表功能
    // 等同於原來的 index.php
    private function index()
    {
        $output = new Output('HTML');
        $output->setVar('messages', $this->guestbook->getAllMessages());
        $output->render('index.tpl.php');
    }
    // 新增表單頁
    // 等同於原來的 add.php
    private function add()
    {
        $output = new Output('HTML');
        $output->setVar('action', 'doAdd');
        $output->render('edit.tpl.php');
    }
    // 新增留言
    // 等同於原來的 do_add.php
    private function doAdd()
    {
        $title = $_POST['title'];
        $author = $_POST['author'];
        $body = $_POST['body'];
        $this->guestbook->addMessage($title, $author, $body);
        $this->redirectTo('./');
    }
    // 輸出 RSS
    // 等同於原來的 rss.php
    private function rss()
    {
        $output = new Output('RSS');
        $output->setVar('items', $this->guestbook->getAllMessages());
        $output->render();
    }
    // 解構函式
    public function __destruct()
    {
        $this->guestbook = NULL;
    }
}

```

在 Actions 類別裡我把原來的頁面全部改成方法，每個方法我稱它為一個 Action 。在建構程式裡會解析 $_GET['act'] 變數所擁有的內容當做 Action 的名稱，這樣外部程式會就可以透過網址參數 act 來決定要呼叫哪一個 Action 。當然如果沒有指定 Action 名稱的話，那麼預設就是 index (列表頁) 。

每個 Action 中會透過呼叫物件的方法 (也可說成傳遞訊息) ，來達成原來頁面裡的流程動作。換句話說 Actions 類別中的每個方法會去指導 Guestbook 該怎麼動作，例如取得所有留言或是新增留言；而如果需要輸出的話，就會透過 Output 物件的 setVar 來拉取 Guestbook 裡的資料，以產生適當格式的輸出。

比較特別的是在 Actions 類別裡的 run 這個方法，我會透過它來執行 act 網址參數所指定的 Action 。換句話說， run 方法是唯一讓外界操作 Actions 物件的介面。

不過要能夠正常運作這些流程的話，我想我還需要一個進入點 (Bootstrap) ，負責建立一個 Actions 物件來開始執行程式；當然這個工作就要交給 index.php ，程式碼改寫如下：

```
<?php
// 載入設定
require_once 'config.php';
// 自動載入類別
function __autoload($class_name)
{
    require_once $class_name . '.php';
}
// 執行對應的動作
$actions = new Actions;
$actions->run();

```

我發現改用新的架構後，不但 index.php 的程式變得簡單俐落許多，而且透過 PHP5 自動載入類別的機制，我也不需要在一開始就載入所有的類別檔案。

### 執行流程

![執行](/resources/webmvc/images/run.png)

光看上面程式的話，其實還滿不容易懂它的執行方式，我還是一步步來分析這個架構的流程好了。

以列表頁的流程為例，它的步驟如下：

* 首先從 index.php 進入程式， index.php 會建立一個 Actions 物件。
* 在建立 Actions 物件的同時，因為沒有 act 這個網址參數，所以 Actions 物件的 action 屬性會預設為 index ；此時 Actions 也會同時在它的內部建立一個 Guestbook 物件。
* Guestbook 物件建立的同時，會預先從檔案中取得所有留言。
* 回到 index.php ，這時會執行 Actions 物件的 run 方法；在 run 方法裡會執行 action 屬性所指向的 index 方法。
* 在 Actions 物件的 index 方法裡，會建立一個 HTML 型態的 Output 物件，並從剛剛建立的 Guestbook 物件裡抓出留言，再塞給 Output 物件。最後用 Output 物件的 render 方法來顯示樣版。
* Output 物件會依照剛剛給的留言內容，一一代換樣版裡的樣版變數，最後呈現結果給瀏覽器。


當然同樣的分析方法，也可以用在新增留言這個動作上面。雖然這樣的流程看起來有點囉嗦，不過我想這就是物件交互的方式，這大概也是初學者很容易搞混的地方。

依照以上的架構，如果我想加入新動作的話，就會變得很直覺。而且我不用把相似的邏輯散放在各個頁面裡，而是獨立在每個層級裡。每個層級可以交由不同的成員去設計或開發，甚至可以加入第三方的函式庫，一切看起來是這麼的美好！

### 還是有缺點

雖然我覺得上面的架構已經很不錯了，但是從我以前的經驗來看，這樣的實作方式還是有些許的缺點。
<h4>不適合初學者</h4>

「不知道要從哪裡開始看懂程式碼！」這是我剛接觸到新架構的感想。其實我在一開始並沒有透過上面的分析來推導出這個架構，而是用蠻幹的方式加上似懂非懂的理論背景去死讀別人的框架原始碼。我身邊有些開發者大多也是遇到了同樣的問題，以致每個人所理解出來的架構都有些許不同。

另外因為新的架構是建構在物件導向的基礎上，所以我如果沒有物件導向的相關知識或經驗的話，也很難想像這樣的架構會如何執行。時下很多框架也是如此，如果初學者一開始沒有正確的觀念，直接照本宣科地把範例做完，可能還是會難以理解框架採用這種架構的好處。

註：架構與框架在這裡我認為是不一樣的概念；架構是指理論上程式交互的方式，並定義出明確而有層次的規範；而框架則是帶有實作，且可以重複利用的程式架構。
<h4>沒有靜態頁</h4>

傳統架構的新增留言表單頁原本只要是一個靜態頁面，但是現在改用樣版技術而造成了些許的效能耗損。然而這點我個人認為是有利有弊，因為有時候我會需要統一化的版型，也就是所謂的 Master Page 。利用樣版技術可以達到這個目標，也是靜態頁所無法提供的。因此用一點點的效能來換取較有彈性的架構，我個人認為是值得的。
<h4>耦合度過高</h4>

從 HTML 樣版和 Output 類別的 fetchRSS 實作中可以看得出來，在輸出留言的部份是以陣列元素的方式去獲取留言裡的內容。這表示其實 Output 和 Guestbook 還是有密切的關係，也就是所謂的高耦合；高耦合表示兩個類別無法獨立使用，這在物件導向原則裡是需要盡可能避免的。

不過事實上這個問題也必須考量到專案的大小，像留言版這種等級的應用項目，目前這樣的耦合程度還可以令人接受。
<h4>網址的易讀性</h4>

改用新架構後，現在入口只會剩下 index.php ；不過這樣一來，原來的網址就得跟著改變。換句話說，原來如下的網址：

```
http://localhost/webmvc/index.php
http://localhost/webmvc/add.php
http://localhost/webmvc/do_add.php
http://localhost/webmvc/rss.php

```

就要改為：

```
http://localhost/webmvc/index.php (不變)
http://localhost/webmvc/index.php?act=add
http://localhost/webmvc/index.php?act=doAdd
http://localhost/webmvc/index.php?act=rss

```

有一些文章指出帶有參數的網址不利人類記憶，而且在 SEO (搜尋引擎最佳化) 上也會有不良的影響。當然我想如果要改善開發效率的話，就勢必要有一點犧牲；不過還好這方面的困擾還能透過網址重寫技術 (URL Rewriting) 來彌補，因此不算是太嚴重的問題。
<h4>新的專案</h4>

採用新架構之後的留言版，我想應該已經比原來的架構更具有彈性，不過如果今天我有多個專案都想使用同樣的架構時該怎麼辦呢？難道裡面的程式碼我還得再重寫一次嗎？或是複製現在這個程式然後做修改呢？

我想答案應該是否定的，因為所謂的框架不是把原來的已經穩定的功能變成另一個專案的垃圾。在我的經驗裡除了同性質的活動只需要更改樣版以外，鮮少有兩個專案的功能是會長得一模一樣；換句話說，如果只是用複製並修改現有程式的方式來開發，那麼可能就有碰到程式炸彈的危險性。減少甚至去除原有客製化的功能，保留基本所需的要素，我想這樣的框架才能夠擁有最大的彈性。

## 建立基本 MVC 框架

從上面改良過的留言版來看，似乎有些功能是可以讓往後的專案重複使用的；但是這些重複的部份，依舊參雜在每個獨立的類別裡。所以我決定把這些功能抽離出來，獨立成一個簡易的框架；但在此之前，我想我有必要先為自己釐清前面架構在 MVC 上的關係。

在「深入淺出設計模式」裡，對 MVC 三個角色的描述如下：

<li>

<strong>Model</strong> - 持有資料、狀態、程式邏輯，並提供介面供人取得資料與狀態。
</li>
<li>

<strong>View</strong> - 用來呈現 Model 中的資料與狀態。
</li>
<li>

<strong>Controller</strong> - 取得使用者的輸入後，並解讀此輸入以轉換成 Model 對應的動作。
</li>


很清楚地，我發現前面的架構已經呈現出 MVC 的基本雛形了，也就是 Guestbook 、 Output 及 Actions 其實可以一一對應到 Model 、 View 和 Controller 。

![轉換成MVC](/resources/webmvc/images/pre_to_mvc.png)

為什麼 Guestbook 是位於 Model 的層級呢？因為我想 Guestbook 這個類別主要是在操作留言訊息的存取，換句話說它掌控了資料與狀態。而且 getAllMessages 和 addMessage 就是 Guestbook 類別對外的介面，所以它就非常符合 Model 的描述。

而在 View 的層級來說，仔細研究桌面應用軟體的 MVC 實作就可以發現，大部份程式是利用視覺元件來組合出讓使用者操作的畫面。在 Output 類別裡雖然我是使用 Template 的作法，不過這很適合 Web 平台的設計與實作。因為要能夠完全以物件來建構畫面，對 HTML 來說是很不方便也非常不直覺；而且如果要能夠快速套用視覺設計人員所製作出來的範本，樣版引擎就會是一個比較好的解決方案。

對應到 Controller 層級的 Actions 類別，所謂的使用者輸入就可以看成是 act 這個網址參數所代表的動作名稱。在 Actions 物件裡會自動轉換這個參數，以呼叫正確的動作來執行。而 Controller 也必須明確地指示 Model 與 View 兩者間的互動方式，而在 Actions 類別裡的確也是這麼處理的。

知道了這層關係之後，我就可以想想哪些部份是可以提煉出來反覆利用的。

### Model

從 Guestbook 的程式來看，事實上我可以完全把檔案操作從裡面獨立出來，然後只定義 Guestbook 的抽象化操作方式。這樣一來我可以直接以參數定義我想用的儲存方式，讓儲存用的類別也變成共用的工具之一。

可是在這裡我決定不這麼做。

為什麼呢？雖然我很明白抽象化的重要性，不過也不能任何事物件做抽象化，因為這樣會陷入「過度設計」的泥淖中。在 Guestbook 這種等級的應用項目裡，我面對的是很簡單的檔案操作，就算有更動也不至於影響其他程式。換句話說，如果今天真的有需要切換搭配的儲存方式時，我還是可以透過重構 Guestbook 來因應環境上的變化。

當然如果今天面對的是大型的應用項目，而且已經確定有重複或相似的變化時，那麼一開始就使用抽象化的設計就會是比較好的選擇。總之，在設計時期就必須要考量專案的大小與變化，以採取不同的方式來因應。

因此這裡我將保留 Guestbook 類別的實作方式，另外留言項目採用陣列輸出的方法也將加以保留。

### View

不同於 Guestbook ，我發現 Output 分成了 HTML 和 RSS 兩種輸出格式；而且在未來可能會套用 AJAX 的狀況下，資料格式也可能加入 JSON 。因此 Output 就需要抽象化，將共用的部份提煉出來，架構圖如下：

![轉換成 View](/resources/webmvc/images/to_view.png)
<h4>建立抽象類別</h4>

那些部份需要被抽離出來呢？從原來的 Output 類別中，我發現 setVar 和 __get 這兩個方法和輸出格式無關，它們的實作我想就可以推到上一層去。至於 render 方法則會因為輸出格式而有不同的實作，那我就把它們變成抽象方法，並且把實作放在子類別裡。比較特別的是 fetchHTML 和 fetchRSS 兩個方法，因為到時候會有子類別來加以區分實作方式；所以這邊我就改用 fetch 這個抽象名稱，讓 render 方法不必為了輸出型態而個別呼叫。

至於抽出來的部份，我想我就用較正式的名稱 View 來做為類別名。所以 View.php 程式如下：

```
<?php
// 抽象視圖類別
abstract class View
{
    // 樣版變數
    protected $vars = array ();
    // 設定樣版變數
    public function setVar($tpl_var, $value = null)
    {
        if (is_array($tpl_var))
        {
            foreach ($tpl_var as $key => $val)
            {
                if ($key != '')
                {
                    $this->vars[$key] = $val;
                }
            }
        }
        else
        {
            if ($tpl_var != '')
            {
                $this->vars[$tpl_var] = $value;
            }
        }
    }
    // 自動取得對應的樣版變數
    private function __get($name)
    {
        return isset($this->vars[$name]) ? $this->vars[$name] : NULL;
    }
    // 抽象：擷取結果
    public abstract function fetch();
    // 抽象：輸出結果
    public abstract function render();
}

```

既然已經將共用的函式抽離出來了，子類別就可以用繼承的方式來實作。
<h4>實作子類別</h4>

首先是用來輸出 HTML 格式內容的子類別，這裡我把原來在 Output 類別中屬於 HTML 的部份放到它身上。而這個子類別因為是 View 的一種，只不過輸出格式為 HTML ，所以它的名稱就以 HtmlView 來表示。以下就是 HtmlView.php 的內容：

```
<?php
// 輸出 HTML 格式內容
class HtmlView extends View
{
    // 取得樣版並解析
    public function fetch()
    {
        $args = func_get_args();
        $template_filename = $args[0];
        $html = '';
        ob_start();
        include 'templates/' . $template_filename;
        $html = ob_get_contents();
        ob_end_clean();
        return $html;
    }
    // 輸出
    public function render()
    {
        // 因為 View 類別的 render 函式沒有參數
        // 所以 render 要自行取得
        $args = func_get_args();
        $template_filename = $args[0];
        header('Content-Type: text/html; charset=utf-8');
        echo $this->fetch($template_filename);
    }
}

```

而 RSS 輸出格式也比照辦理：

```
<?php
// 輸出 RSS 格式內容
class RssView extends View
{

	// 轉換成 RSS 內容
    public function fetch()
    {
        $xml = '';
        $xml .= '<' . '?xml version="1.0" encoding="utf-8"?' . '>' . "\n";
        $xml .= '<rss version="2.0">';
        $xml .= '<channel>';
        $xml .= '<title>TEST</title>';
        $xml .= '<description>TEST</description>';
        foreach ($this->items as $item)
        {
            $xml .= '<item>';
            $xml .= '<title>' . $item['title'] . '</title>';
            $xml .= '<description>' . $item['body'] . '</description>';
            $xml .= '</item>';
        }
        $xml .= '</channel>';
        $xml .= '</rss>';
        return $xml;
    }
    // 輸出
    public function render()
    {
        header('Content-Type: text/xml; charset=utf-8');
        echo $this->fetch();
    }
}

```

現在 View 的部份已經完成了抽象化，未來如果要加入新的輸出格式，我只需要繼承 View 這個抽象類別，再實作 fetch 和 render 兩個方法即可。

### Controller

Actions 本身並沒有對應到多種格式的問題，不過它還是有些部份是一些應用程式常會需要用到的；換句話說，我可以把與留言版無關的部份抽離出來。
<h4>建立抽象類別</h4>

仔細觀察 Actions 類別的實作，我發現可以抽離的部份有 run 、 redirectTo 兩個方法，所以我決定把這些部份抽離到新的 Controller 類別裡。另外我也希望預設的 index 方法 (動作) 一定要被子類別實作，所以我也把它變成抽象類別裡的抽象方法。

```
<?php
// 抽象控制類別
abstract class Controller
{
    // 動作名稱
    protected $action = '';
    // 抽象：預設動作
    protected abstract function index();
    // 執行動作
    public final function run()
    {
        $this->{$this->action}();
    }
    // 頁面重導向
    protected function redirectTo($url)
    {
        header('Location: ' . $url);
    }
}

```

然而在 Actions 類別的建構式中有段程式很特別，那就是解析 $_GET['act'] 的部份，它似乎也是開發新的應用程式會使用到的功能。可是先前我自己說過使用 GET 參數的方式，會讓網址不容易讓瀏覽者記憶，因此在新專案裡我想使用網址重寫的技術。但這又有另一個問題，因為現存的這個留言板專案已經提供瀏覽者固定的 RSS 位址，所以想更動原有解析 $_GET['act'] 的部份也變得不可行。

那麼有沒有什麼方法可以讓不同的專案使用不同的動作解析？而且還能不更動到抽象的 Controller 類別呢？

註：在 IIS 上，網址重寫技術也必須依賴其他 ISAPI 擴展才能實現。所以預設的情況下，還是得靠 GET 參數來提供 action 的名稱。
<h4>可替換的路由器</h4>

如果說我把解析網址的動作抽離到一個獨立的類別裡，讓 Controller 能以透過更換類別的方式來因應不同專案的網址樣式，這樣不是很好嗎？路由器就是在這樣的想法下，所產生出來的類別。路由器可以讓瀏覽者輸入不同網址時，協助 Controller 判斷該調用哪個動作來執行。

有了這樣的想法後，我便將解析 GET 參數的程式碼移到了 Router 類別：

```
<?php
// 預設的路由器
class Router
{
    // 預設的動作
    protected $action = 'index';
    // 在建構函式中解析 GET 變數
    public function __construct()
    {
        $this->action = isset($_GET['act']) ? strtolower($_GET['act']) : 'index';
    }
    // 取得解析後的動作名稱
    public function getAction()
    {
        return $this->action;
    }
}

```

然後在 Controller 類別加入以下部份：

```
<?php
// 抽象控制類別
abstract class Controller
{
    // 略 ...
    // 路由器
    protected $router = NULL;
    // 設定路由器
    public function setRouter(Router $router)
    {
        if (method_exists($this, ($action = $router->getAction())))
        {
            $this->action = $action;
        }
    }
    // 略...
}

```

這樣一來，我就可以透過更換 Router 的實作，來達到解析不同網址樣式的目的。
<h4>建立自訂的 Controller </h4>

有了抽象的 Controller 類別，現在我就需要把留言板原來動作的部份分離出來，一般框架都是用 IndexController 來當做預設的名稱，它是繼承自 Controller 的類別：

```
<?php
// 自訂的 Controller
class IndexController extends Controller
{
    // 共用的留言板物件
    private $guestbook = NULL;
    // 建構函式
    public function __construct()
    {
        $this->guestbook = new GuestBook;
    }
    // 預設的列表功能
    protected function index()
    {
        $view = new HtmlView;
        $view->setVar('messages', $this->guestbook->getAllMessages());
        $view->render('index.tpl.php');
    }
    // 新增表單頁
    protected function add()
    {
        $view = new HtmlView;
        $view->setVar('action', 'doAdd');
        $view->render('edit.tpl.php');
    }
    // 新增留言
    protected function doAdd()
    {
        $title = $_POST['title'];
        $author = $_POST['author'];
        $body = $_POST['body'];

        $this->guestbook->addMessage($title, $author, $body);
        $this->redirectTo('./');
    }
    // 輸出 RSS
    protected function rss()
    {
        $view = new RssView;
        $view->setVar('items', $this->guestbook->getAllMessages());
        $view->render();
    }
    // 解構函式
    public function __destruct()
    {
        $this->guestbook = NULL;
    }
}

```

從上面的程式可以看到，原來的 Output 類別已經被代換成 HtmlView 和 RssView 兩個類別了；而這兩個類別用法和原來的 Output 類別相差無幾，但是擴充性上卻好更多。

<h4> 重整架構</h4>

現在我已經有了幾個共用的抽象類別，還有繼承自它們的子類別實作，但是我不希望把它們都放在一起，這樣的網站架構看起來非常淩亂。而且如果後面需要建立一個新專案時，我希望能花費最小的更動就能從目前的專案中把共用的框架分離出來。

以下是我對整個檔案結構的安排：

```
Project (專案目錄)
|
|- core (核心框架)
|  |
|  |- Controller.php
|  |
|  |- Router.php
|  |
|  |- View.php
|
|- controllers (自訂的 Controller 存放目錄)
|  |
|  |- IndexController.php
|
|- models (自訂的 Model 存放目錄)
|  |
|  |- Guestbook.php
|
|- views (自訂的 View 存放目錄)
|  |
|  |- HtmlView.php
|  |
|  |- RssView.php
|
|- database (資料庫存放位置，非必要)
|  |
|  |- guestbook.txt
|
|- templates (HTML 樣版)
|  |
|  | - edit.tpl.php
|  |
|  | - index.tpl.php
|
|- theme (網站風格)
|  |
|  |- images
|  |  |
|  |  |- bg.png
|  |
|  |- main.css
|
|- config.php (網站設定)
|
|- index.php (進入點)

```

在使用了這個檔案架構後，相關路徑也需要做調整，例如樣版 CSS 的位置要改到 theme 底下。不過框架的檔案架構並不是一定要依照上面的規劃方式，我看過有些框架把 controllers 、 models 和 views 三個資料夾，放在一個 application 目錄裡，這樣就可以在同一專案下，建立不同的應用項目。

假設現在我要建立一個新專案，那麼我只需要把 core 、 config.php 和 index.php 複製到新專案的資料夾，然後再依照上面的結果把相關的目錄建立出來就可以撰寫新的程式了。當然 HtmlView 在新專案裡應該也是會用得到，因此也可以一併複製過去；不過在新的專案裡，我也還是可以使用 Smarty 或其他的 Template 引擎來實作 View 的部份，這就是抽象化的好處。
<h4>更新進入點的寫法</h4>

不過事情沒那麼簡單，換了新檔案結構後，原來的 index.php 在自動載入類別的功能就會失效了；這是因為我沒有把 include_path 設定好的關係。不過我不希望去修改 php.ini ，也不想從 .htaccess 設定檔下手 (因為 IIS 上不能用) ；所以我得改用 set_include_path 這個函式。

另外由於 Controller 的實作已經交棒給 IndexController ，因此我也必須把原來的 Actions 給換掉。

新的 index.php 如下：

```
<?php
// 載入設定
require_once 'config.php';
$include_path = array ();
// 系統的 include_path
$include_path[] = get_include_path();
// 目前專案所需要的 include_path
$include_path[] = APP_REAL_PATH . '/core';
$include_path[] = APP_REAL_PATH . '/controllers';
$include_path[] = APP_REAL_PATH . '/models';
$include_path[] = APP_REAL_PATH . '/views';
// 設定新的 include_path
set_include_path(join(PATH_SEPARATOR, $include_path));
function __autoload($class_name)
{
    require_once $class_name . '.php';
}
$controller = new IndexController;
$controller->setRouter(new Router);
$controller->run();

```

從上面的程式中可以看到 index.php 的結構還是很簡單，只差多了 include_path 的設定與分離出路由器的實作而已。現在我能確保留言板能正常運作，而且大部份共用的功能可以拿到新專案上使用，從這裡可以看到建構 MVC 框架是非常值得的一件事情。

### 其他部份

上面的框架只是很簡單的概念實作，因為除了 MVC 以外，一個框架要考量到的部份其實還有很多。像是如何與資料庫做結合、自動化測試、框架產生器等等，這些都會是一個好的框架所需要的部份。因此多吸取目前網路上一些公開框架的經驗，才能對框架的應用有更深一層的瞭解。

不過倒也不用認為框架就一定非常龐大，像有些框架就只會定義一些基本的抽象類別 (像上面我實作的這個版本) ，而有些框架則會提供很多類別庫來讓開發人員使用 (像是 .Net Framework 或 [Zend Framework](http://framework.zend.com/)) ；而有些框架則是有特定用途，它們有可能建構在另一個框架上面 (就像 [CakePHP](http://www.cakephp.org/) 建構在 [PHP](http://www.php.net) 這個大框架上) 。所以框架的組成不會只侷限在 MVC 之下，只是在這裡 MVC 是我所想要釐清的部份而已。

註： PHP 本來就是基於 Web 開發而出現的一套語言框架。

## 結論

其實學過寫程式的人都知道，如何為一支程式起頭是最困難的一件事；不過如果有一個好用的框架產生器再配合一個不錯的入門文件的話，這個問題通常很容易被解決 (不過對大部份複雜的專案來說還是天方夜譚) 。因此像 [Ruby on Rails](http://www.rubyonrails.org/) 或 [CakePHP](http://www.cakephp.org/) 這類的程式框架，也就受到許多人的重視與推崇。

而使用框架最大的好處，就是它們隱藏了許多看起來很複雜的機制；換句話說，它提供了一個抽象化的設計架構，讓開發人員可以依照自己的想法去建構出所需要的應用項目。這些抽象化的部份，像是 Controller 、 View 等，都能夠減少開發人員在處理底層程式的時間。而且透過框架產生器，就連複製基本框架的動作也都省了，不可謂不方便。

但是一個好的 Web 開發者一定要瞭解這些框架背後運作的原理，不然如果拿掉這些所謂的框架後，我想要寫出一個基本的留言板就不是那麼容易的一件事了 (想想看以前寫 CGI 的時代) 。雖然框架隱藏了很多細節，但不表示 Web 開發者就可以完全忽略這些細節；很多進階的功能都會需要熟悉這些原理後才有辦法實作出來，所以千萬不能因為會使用某個框架而自得意滿。

## 範例下載

照慣例，我把上面的範例碼放在底下：

* [原始留言版](/resources/webmvc/source/v1.zip)

* [改良後的 MVC 留言板](/resources/webmvc/source/v2.zip)

* [架構在 MVC 框架上的留言板 ](/resources/webmvc/source/v3.zip)


