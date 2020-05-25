---
title: '[jQuery] 自製 jQuery Plugin - Part 2'
date: 2008-05-16T00:00:00+08:00
tags:
  - JavaScript
  - jQuery
---

在 [Part 1](http://www.jaceju.net/blog/archives/336) 我們看到如何建立一個 jQuery Plugin 的雛形，也讓它能夠做一些簡單的動作了。只是這個 Plugin 似乎沒什麼太大的用途，所以接下來我們就來寫個真正能用的東西。

<!-- more -->

## 簡單的頁籤功能

要舉個簡單又實用的教學用例子，一直都是非常困難的事情。經過多次的思考與挑選，我決定用頁籤功能 (Tab) 來當做本文練習的重點。

當然 jQuery 已經有一些 Tab 相關的 Plugin 了，而且基於不重造輪子的理念下，我們似乎不應該自己動手；不過站在學習的角度下，如果我們自己實作一個簡單的頁籤的話，將會有助於瞭解 jQuery Plugin 的設計過程。

以下先來瞭解我們需要的功能，再來想想看怎麼實作它。

首先我們的頁籤大概會長成這樣子：

![頁籤基本形式](/resources/jquery_plugin_tutorial/mytab01.jpg)

![頁籤基本形式](/resources/jquery_plugin_tutorial/mytab02.jpg)

![頁籤基本形式](/resources/jquery_plugin_tutorial/mytab03.jpg)

基本上我們要的效果就是在點選上面的 TAB1 、 TAB2 及 TAB3 時，底下的文字區塊會跟著切換，這就是最簡單的頁籤功能了。

## 頁面結構

在 HTML 的部份也非常簡單，基本上是一個 UL 清單 (div.tabs ul) 加上三個 DIV 區塊 (div.tabBlock) ，最後再用一個大 DIV 區塊 (div#mytab) 把它們包起來。

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>jQuery TEST</title>
<link href="mytab.css" rel="stylesheet" type="text/css" />
</head>
<body>
<div id="mytab">
<div class="tabs">
<ul>
<li class="active"><a href="#tab1"><span>TAB1</span></a></li>
<li><a href="#tab2"><span>TAB2</span></a></li>
<li><a href="#tab3"><span>TAB3</span></a></li>
</ul>
</div>
<div id="tab1" class="tabBlock">
有時候寫 jQuery 時，常會發現一些簡單的效果可以重複利用。只是每次用 Copy &amp;amp; Paste 大法似乎不是件好事，有沒有什麼方法可以讓我們把這些效果用到其他地方呢？
</div>
<div id="tab2" class="tabBlock">
沒錯，就是用 jQuery 的 Plugin 機制。不過 jQuery 的 Plugin 機制好像很難懂？其實一點也不。以下我用最簡單的方式來為大家解說如何自製一個簡單的 Plugin 。
</div>
<div id="tab3" class="tabBlock">
當然在此之前，你得先瞭解 JavaScript 的 class 、 object 、 variables scope 還有 anonymous function 等基礎...
</div>
</div>
<script type="text/javascript" src="jquery/1.2.3.js"></script>
<script type="text/javascript" src="jquery/mytab.js"></script>
<script type="text/javascript">
$(function () {
    $('#mytab').mytab();
});
</script>
</body>
</html>

```

當然別忘了把 JavaScript 檔案引入，這裡我先把 mytoolbox.js 改為 mytab.js ，因為我們要做的是頁籤。

而頁籤樣式的部份則以是 CSS 來完成，請把它存檔並命名為 mytab.css ：

```css
div.tabBlock {
clear:both;
margin-top:-1px;
border:1px solid #CCC;
padding:5px;
}
div.tabs {
margin-bottom:-1px;
overflow:hidden;
}
div.tabs ul {
margin:0;
padding:0;
list-style:none;
}
div.tabs ul li {
float:left;
height:25px;
margin:0 3px;
line-height:25px;
font-size:9pt;
border:1px solid #CCC;
overflow:hidden;
}
div.tabs ul li a {
display:block;
padding:3px;
color:#000;
text-decoration:none;
}
div.tabs ul li.active a,
div.tabs ul li a:hover {
color:#FFF;
background:#999;
}

```

這裡我們就不深究 CSS 怎麼做的了，有興趣的朋友請自行參考相關書籍。

## 準備 Plugin 樣版

現在把 Part 1 的 mytoolbox.js 複製為 mytab.js ，然後稍做修改，如下：

```js
;(function($) {
    $.fn.mytab = function(settings) {
        var _defaultSettings = {};
        var _settings = $.extend(_defaultSettings, settings);
        var _handler = function() {
            // 從這裡開始
        };
        return this.each(_handler);
    };
})(jQuery);

```

從上面的程式中可以看到我把 _defaultSettings 的內容清掉了，因為我們暫時用不到特別的設定。然後我把給 each 方法用的 callback 獨立為 _handler 函式，因為後面我們要做的動作大部份都會在這裡發生。

## 呈現頁籤下的區塊

在套上 CSS 後，我們會看到三個 div.tabBlock 區塊同時都顯示出來了，這樣做的目的其實是為了當瀏覽器沒有開 JavaScript 時還能呈現資訊。而在開啟了 JavaScript 後，我希望只呈現第一個 div.tabBlock 區塊，這時我們就可以利用 jQuery 來完成：

```js
var _handler = function() {
    $('div.tabBlock', this).hide().eq(0).show();
};

```

在解釋原理之前，先回頭看一下 HTML 頁面呼叫  Plugin 的地方，你會發現我把 Plugin 套用在 div#mytab 這個元素上，所以在 _handler 裡的 `this` 其實是指向 div#mytab 。

 瞭解 `this` 代表的意義後，接著回到 _handler 中，我們就可以知道第一行的 $('div.tabBlock', this) 其實就是指抓取 div#mytab 底下的三個 div.tabBlock 元素。所以第一行我們先把所有的 div.tabBlock 隱藏起來，然後利用 .eq(0).show() 把第一個 div.tabBlock 顯示出來。

## 讓頁籤動起來

接著我們先讓頁籤在點選時能夠切換它的反白狀態，而反白的效果我們已經定義 CSS 裡了，也就是讓 LI 的 class 變成 active 即可：

```js
var _handler = function() {
    $('div.tabBlock', this).hide().eq(0).show();
    $('div.tabs li a', this).click(function () {
        $('div.tabs li').removeClass('active');
        $(this).parent('li').toggleClass('active');
        return false;
    });
};

```

這邊的原理也很簡單，首先先讓所有 div.tabs li 都移除反白效果，然後再對我們按的連結的上一層 LI 元素套上 active 。注意這裡也有個 `this` ，它代表的是目前點選的頁籤連結。

最後我們要 `return false` ，以阻止 click 事件被往上傳遞。

現在點選看看頁籤連結，是不是能反白了呢？

註：滑過頁籤會呈現反白這個效果也是定義在 CSS 裡，試著找找看吧。

## 記住「這個」

在繼續完成效果前，有個問題我得先說明一下。雖然我們在測試頁面上只佈置了一個 Tab 元件，不過很難保證頁面上不會有其他地方也會用到頁籤效果，這時我們的 Plugin 可能會產生副作用。

問題出在 `$('div.tabs li').removeClass('active')` 這行，因為我們不能確定頁面其他地方是不是也有有元素符合 `$('div.tabs li')` 。所以我在這裡應該要明確指定這些 LI 元素應該屬於那個元素，也就是 `$('div.tabs li a', this)` 的 `this` (即 `div#mytab` ) 。

不過在 click 方法指定的匿名函式中， `this` 又指到 a 元素，而不是我們要的 `div#mytab` ；那麼有什麼方法能在 click 中找到 `div#mytab` 呢？總不能把 `div#mytab` 寫死在 Selector 中吧？其實方法很簡單，就是在 click 外先定義一個新變數指向外部的 `this` ：

```js
var _handler = function() {
    var container = this; // 加入這行，並將以下表示 div#mytab 的 `this` 改為 container
    $('div.tabBlock', container).hide().eq(0).show();
    $('div.tabs li a', container).click(function () {
        $('div.tabs li', container).removeClass('active');
        $(this).parent('li').toggleClass('active'); // 這個 `this` 不用動，它表示 a 元素
        return false;
    });
};

```

因為在 click 的匿名函式會繼承外部的作用域，使得 `container` 的 scope 得以存在於 click 的 callback 裡；因此我們就能放心的使用 `container` 來表示 `div#mytab` 了。

註：在 click 裡的 callback 又有另一個名稱： closure ，因為它用到了外部 function 所定義的變數。

## 切換對應的區塊

接著繼續完成我們要的功能，也就是切換頁籤對應的區塊。

這裡我用了連結錨點的技巧，這個技巧本身有個優點：就是當 JavaScript 被禁用時，錨點還能正常動作。而錨點的名稱剛好就是頁籤所對應的內容區塊 ID ，這就方便我們找到要顯示的內容區塊。

程式碼如下：

```js
var _handler = function() {
    var container = this;
    $('div.tabBlock', container).hide().eq(0).show();
    $('div.tabs li a', container).click(function () {
        $('div.tabs li', container).removeClass('active');
        $(this).parent('li').toggleClass('active');
        $('div.tabBlock', container).hide(); // 先全部藏起來
        var id = (String(this.href).match(/(#.+)$/))[1]; // 只抓對應的 tabBlock id
        $(id).show(); // 顯示對應的 tabBlock
        return false;
    });
};

```

原理一樣很簡單，當按下頁籤連結時，先隱藏所有內容區塊 (`div.tabBlock`) ，然後取得連結的 href 位址中的錨點名稱，以顯示頁籤所對應的內容區塊。不過這裡要注意一點，那就是瀏覽器通常會幫我們在錨點名稱前加入目前完整的網址；因此我這裡便使用正規式來取得帶井字號的錨點名稱，也剛好直接讓 jQuery 使用。

## 減少多餘的查詢

再看一次程式，我發現有個地方重複查詢了兩次，那就是 `$('div.tabBlock', container)` ；第一次是在我們只顯示第一個內容區塊時，而第二次則在點選連結時要隱藏所有內容區塊時。這裡我們可以利用暫存變數來解決：

```js
var _handler = function() {
    var container = this;
    var $tabBlocks = $('div.tabBlock', container); // 加入這行
    $tabBlocks.hide().eq(0).show(); // 改用 $tabBlocks
    $('div.tabs li a', container).click(function () {
        $('div.tabs li', container).removeClass('active');
        $(this).parent('li').toggleClass('active');
        $tabBlocks.hide(); // 改用 $tabBlocks
        var id = (String(this.href).match(/(#.+)$/))[1];
        $(id).show();
        return false;
    });
};

```

不過也不是每個重複的查詢都要用暫存變數，因為假設當你在 Plugin 運作的過程中，對 `div.tabBlock` 有進行增減的話，那麼重複再查一次就是必要的動作了，這樣才能確保我們抓到正確數量的元素集。

到這裡我們的 mytab.js 初版算是完成了，試試看它是不是依照我們的要求正確動作呢？

## 加強 Plugin

雖然我們的 Plugin 已經可以動作了，但其實還是有些地方可以加強；而加入這些功能其實就是為了讓 Plugin 能更有彈性，以應付各種不同的狀況。

這裡我簡單介紹兩個加強的功能：

### 由外部決定 class

我們希望可以指定 active 的名稱，讓外部可以自行決定。我們在 `_defaultSettings` 中多定義了一個 `activeClass` 項目，然後把程式裡的所有 `'active'` 改為 `_settings.activeClass` 。程式碼修改如下：

```js
$.fn.mytab = function(settings) {
    var _defaultSettings = {
        activeClass: 'active'
    };
    var _settings = $.extend(_defaultSettings, settings);
    var _handler = function() {
        var container = this;
        var $tabBlocks = $('div.tabBlock', container);
        $tabBlocks.hide().eq(0).show();
        $tabLinks.click(function () {
            $tabLists.removeClass(_settings.activeClass);
            $(this).parent('li').toggleClass(_settings.activeClass);
            $tabBlocks.hide();
            var id = (String(this.href).match(/(#.+)$/))[1];
            $(id).show();
            return false;
        });
    };
    return this.each(_handler);
};

```

同樣的原理，我們可以更改 `div.tabs` 和 `div.tabBlock` 的 class 名稱，這邊我留給各位自行試試。

### 自動切換內容區塊

現在我希望進入頁面時，能讓內容區塊自動跳到我指定的頁籤。這裡我有兩種方式可以指定：由網址決定以及用 Server 程式決定。

以網址決定就是我們在瀏覽器的網址列的網址後面再加上錨點名稱，例如：

```
http://localhost/mytab.htm#tab2
```

這個網址可以由外部的網頁以連結的方式指定，這樣的話進入我們這個頁籤畫面時，我們就可以依照這個錨點來決定要顯示的內容區塊。程式很簡單：

```js
var _handler = function() {
    var container = this;
    var $tabBlocks = $('div.tabBlock', container);
    // 加入以下這段
    var matches = (String(location.href).match(/(#.+)$/));
    if (null !== matches) {   // 有找到網址錨點的話就切換內容
        var id = matches[1];
        $tabBlocks.hide();    // 先把全部的內容區塊藏起來
        $(id).show();         // 顯示錨點對應的內容區塊
        // 將對應的頁籤連結反白
        $('div.tabs li', container).removeClass(_settings.activeClass);
        $('div.tabs li a', container).each(function () {
            if (-1 !== String(this.href).indexOf(id)) {
                $(this).parent('li').toggleClass(_settings.activeClass);
            }
        });
    } else {
        $tabBlocks.hide().eq(0).show();
    }
    // ... 略 ...
};

```

原理就是透過錨點來顯示對應的內容區塊，再跟著把對應頁籤連結反白即可；如果沒有指定錨點的話，就顯示第一個內容區塊。

當然別忘了重構，把多餘的查詢動作用暫存變數取代：

```js
var _handler = function() {
    var container = this;
    var $tabBlocks = $('div.tabBlock', container);
    var $tabLists = $('div.tabs li', container);
    var $tabLinks = $('div.tabs li a', container);
    var matches = (String(location.href).match(/(#.+)$/));
    if (null !== matches) {
        var id = matches[1];
        $tabBlocks.hide();
        $(id).show();
        $tabLists.removeClass(_settings.activeClass);
        $tabLinks.each(function () {
            if (-1 !== String(this.href).indexOf(id)) {
                $(this).parent('li').toggleClass(_settings.activeClass);
            }
        });
    } else {
        $tabBlocks.hide().eq(0).show();
    }
    $tabLinks.click(function () {
        $tabLists.removeClass(_settings.activeClass);
        $(this).parent('li').toggleClass(_settings.activeClass);
        $tabBlocks.hide();
        var id = (String(this.href).match(/(#.+)$/))[1];
        $(id).show();
        return false;
    });
};

```

回到主題，我們的另外一種指定內容區塊的方式就是在 Server 端輸出 HTML 時，就先決定好 active 的 LI 元素了。假設現在頁籤部份的 HTML 如下：

```html
<div class="tabs">
<ul>
<li><a href="#tab1"><span>TAB1</span></a></li>
<li class="active"><a href="#tab2"><span>TAB2</span></a></li>
<li><a href="#tab3"><span>TAB3</span></a></li>
</ul>
</div>

```

現在 TAB2 這個 LI 元素的 class 是 active ，那麼我們應該怎麼自動切換到對應的內容區塊呢？很簡單，就讓 `li.active` 底下的 a 「點下去」就可以了。程式如下：

```js
var _handler = function() {
    // ... 略 ...
    $tabLinks.click(function () {
        $tabLists.removeClass(_settings.activeClass);
        $(this).parent('li').toggleClass(_settings.activeClass);
        $tabBlocks.hide();
        var id = (String(this.href).match(/(#.+)$/))[1];
        $(id).show();
        return false;
    });
    // 加入這段
    var $activeLink = $('div.tabs li.' + _settings.activeClass + ' > a', container);
    if (0 !== $activeLink.size()) {
        $activeLink.trigger('click');
    }
};

```

原理就是在我們指定好頁籤連結的 click 事件後，再觸發 `li.active` 底下的連結的 click 事件即可，很簡單吧。

## 測試再測試

以上我們都只在單一個頁籤元件上測試而已 (也就是 `div#mytab` ) ，但一般來說大部份的 Plugin 應該要能在頁面中被套用到多個元件上；換句話說就是頁面上會好幾個有頁籤的區塊，所以這裡我們得測試這個可能發生的狀況。

我在原來的 `div#mytab` 底下再加入一個 `div#mytab2` ，內容和 `div#mytab` 差不多，只是把 `#tab1`, `#tab2`, `#tab3` 改成 `#tab4`, `#tab5`, `#tab6` 而已：

```html
<div id="mytab2">
<div class="tabs">
<ul>
<li><a href="#tab4"><span>TAB4</span></a></li>
<li class="active"><a href="#tab5"><span>TAB5</span></a></li>
<li><a href="#tab6"><span>TAB6</span></a></li>
</ul>
</div>
<div id="tab4" class="tabBlock">
aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa
</div>
<div id="tab5" class="tabBlock">
bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb bbb
</div>
<div id="tab6" class="tabBlock">
ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc ccc
</div>
</div>

```

然後我也為 `div#mytab` 和 `div#mytab2` 加入一組 `class="mytab"` ：

```html
<div id="mytab" class="mytab">
... 略 ...
<div id="mytab2" class="mytab">

```

現在我們把 HTML 頁面上套用 Plugin 的部份稍作修改，也就是把 id 換成 class ：

```js
$(function () {
    $('.mytab').mytab();
});

```

然後我們重新瀏覽一下，一切看起來很正常。直到我測試了用網址錨點來自動切換內容區塊時...出現了下圖的奇怪現象：

![頁籤基本形式](/resources/jquery_plugin_tutorial/mytab04.jpg)

原因出在我們發現錨點時，就會先隱藏所有內容區塊，然後才顯示錨點對應的內容區塊；但是這樣就會使得沒有錨點對應的內容區塊通通不顯示，出現了上圖的狀況。

怎麼辦？其實也很簡單，就是將該頁籤元件所擁有的頁籤連結對應的錨點先記下來，然後找找看網址描點有沒有在這裡面，有的話才做上面的動作，不然就一定要顯示第一個內容區塊：

```js
var _handler = function() {
    var container = this;
    var $tabBlocks = $('div.tabBlock', container);
    var $tabLists = $('div.tabs li', container);
    var $tabLinks = $('div.tabs li a', container);
    var tabIdList = [];
    // 先記住所有頁籤連結對應的錨點
    $tabLinks.each(function () {
        var matches = (String(this.href).match(/(#.+)$/));
        if (null !== matches) {
            tabIdList.push(matches[1]);
        }
    });
    var matches = (String(location.href).match(/(#.+)$/));
    if (null !== matches // 錨點在列表裡的話就顯示
    &amp;&amp; -1 !== $.inArray(matches[1], tabIdList)) {
        var id = matches[1];
        $tabBlocks.hide();
        $(id).show();
        $tabLists.removeClass(_settings.activeClass);
        $tabLinks.each(function () {
            if (-1 !== String(this.href).indexOf(id)) {
                $(this).parent('li').toggleClass(_settings.activeClass);
            }
        });
    } else {
        $tabBlocks.hide().eq(0).show();
    }
    // ... 略 ...
};

```

這裡我用了最簡單 JavaScritp 的陣列，還有 jQuery 的 `$.inArray` 方法來解決這個問題；想想看，有沒有更方便的解法呢？

之後當然我們還得再多試試幾個不同的狀況，看看還有沒有需要解決的部份，這裡就留給大家試試看囉。

## 還有什麼

在看完以上的介紹後，我想自己寫一個 jQuery 的 Plugin 其實並不困難，困難的是我們要怎麼去完成裡面的內容。所以像是對 JavaScript 的作用域的認知、各家瀏覽器的差異、 DHTML 的基本功，還有如何去呈現效果的想像力等，這些都是在開發 jQuery Plugin 非常重要的。

另外就是一定要對程式碼做重構與測試的動作，因為它們會影響這個 Plugin 的效能與穩定性。這裡可以多參考其他 Plugin 作者的程式碼，觀察他們是如何處理效能問題；然後最好能建立一個測試頁面，把有可能遇到的使用方式儘可能地包含進來，以便測試 Plugin 的正確性。

希望透過這兩篇簡單的教學，能讓大家能快速進入 jQuery Plugin 的世界；也希望大家如果開發了好的 Plugin 後，能不吝分享出來。

感謝大家~~謝謝收看。
