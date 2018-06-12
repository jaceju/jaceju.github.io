---
layout: post
title: '[jQuery] 自製 jQuery Plugin - Part 1'
date: 2008-5-13
wordpress_id: 336
comments: true
tags: ["JavaScript", "jQuery"]
---

有時候寫 jQuery 時，常會發現一些簡單的效果可以重複利用。只是每次用 Copy &amp; Paste 大法似乎不是件好事，有沒有什麼方法可以讓我們把這些效果用到其他地方呢？

沒錯，就是用 jQuery 的 Plugin 機制。

不過 jQuery 的 Plugin 機制好像很難懂？其實一點也不。以下我用最簡單的方式來為大家解說如何自製一個簡單的 Plugin 。

當然在此之前，你得先瞭解 JavaScript 的 class 、 object 、 variables scope 還有 anonymous function  等基礎，這些可以參考「[ JavaScript 大全](http://tlsj.tenlong.com.tw/WebModule/BookSearch/bookSearchViewAction.do?isbn=9789866840036&amp;sid=37518)」一書。

<!--more-->

## Plugin 樣版

寫 jQuery 的 Plugin 最快的方法就是拿現成的 Plugin 來改，只是在那麼多的 Plugin 中怎麼找到好的範例呢？別擔心，這邊我提供一個最簡單的範例樣版：

```js
jQuery.fn.mytoolbox = function() {
    return this.each(function() {
    });
};

```

首先， `mytoolbox` 就是我們的 plugin 名稱，利用 `jQuery.fn` 我們可以將它註冊為 jQuery 的 plugin 。然後我們把  `jQuery.fn.mytoolbox` 指向一個匿名函式 (anonymous function) ，又稱為 callback ；而這個 callback 的內容很簡單，就是利用 jQuery 的 `each` 方法，來一一執行對應的動作。

特別要注意匿名函式裡的 `this` 關鍵字，它會指向一個 jQuery 物件；而這個 jQuery 物件則是我們要指定的，稍後我會再進一步說明。

## 使用 Plugin

現在將上面的樣版存成 mytoolbox.js ，和 jquery.js 放在一起。然後建立一個 HTML 測試檔案，內容如下：

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>jQuery TEST</title>
<style type="text/css">
.test {
border:1px solid #CCC;
cursor:pointer;
padding:3px;
}
</style>
</head>
<body>
<div id="test1" class="test">
點我！
</div>
<div id="test2" class="test">
點我！
</div>
<div id="debug"></div>
<script type="text/javascript" src="jquery/1.2.3.js"></script>
<script type="text/javascript" src="jquery/mytoolbox.js"></script>
<script type="text/javascript">
$(function () {
    $('.test').mytoolbox();
});
</script>
</body>
</html>

```

首先 HTML 中引用了 jQuery 函式庫及我們寫的 Plugin 檔案，然後我在畫面上佈置了兩個 class 為 `test` 的 div 元素。接著我們用以下程式碼來呼叫我們的 Plugin ：

```js
$(function () {
    $('.test').mytoolbox();
});

```

這邊的用意就是將上面那兩個 div 套上 mytoolbox 這個 Plugin ，這樣 Plugin 就能動了，很簡單吧？

## 加入動作

當然，這個 Plugin 什麼事都還沒開始做，是個空骨架而已。現在我們要為它加血添肉，讓它動起來。

先簡單在 `each` 的 callback 裡加入一行：

```js
jQuery.fn.mytoolbox = function() {
    return this.each(function() {
        alert(this.id); // 加入此行
    });
};

```

再重新瀏覽測試用的 HTML 檔，你會發現頁面自動跳出了兩次訊息視窗，內容分別是 test1 和 test2 ；這證明了我們的 Plugin 的確有套用在 class 為 `test` 的兩個 div 上面。

不過現在有兩個 `this` ，它們是一樣的東西嗎？不，因為 scope 及觸發對象的不同，它們兩個是不同的東西。在外面的 `this` 是一個 jQuery 物件，指向我們指定的 `$('.test')` 這個物件；而 `each` callback 裡的 `this` 則是 div 元素，因為 `each` 是個 iterator function ，因此 `alert(this.id)` 會執行兩次。在第一次的 `this` 會指向 `#test1` 這個 div ，第二次則指向 `#test2` 這個 div 。

註：這裡我用 `#test1` 表示 id 為 `test1` 的元素。

現在我希望改成按下 div 元素後才會 alert 該元素的 id ，這要怎麼做呢？我們要改用 click 事件，做法如下：

```js
jQuery.fn.mytoolbox = function() {
    return this.each(function() {
        jQuery(this).click(function () {
            alert(this.id);
        });
    });
};

```

由於 `each` callback 裡的 `this` 是 DOM 元素，所以我們要用 jQuery() 把 `this` 包起來，這樣才能方便指定該元素的 click 事件。現在重新瀏覽頁面，點選任何一個 div ，應該就會跳出對應的訊息視窗了。

## 再包一層

如果在 `each` 的 callback 裡會呼叫到多次的 jQuery 的話，一直寫 `jQuery` 這幾個字實在是很累人的一件事；而且 `jQuery` 不是可以簡寫成 `$` 號嗎？不能直接用嗎？當然可以，只是這樣可能會和其他 JavaScript Library 發生衝突；所以我們要改用以下的方式來包覆我們的 Plugin ：

```js
;(function($) {
    $.fn.mytoolbox = function() {
        return this.each(function() {
            $(this).click(function () {
                alert(this.id);
            });
        });
    };
})(jQuery);

```

JavaScript 可以直接用一組小括號 `()` 包覆一個匿名函式，然後後面再接一組小括號 `()`  表示呼叫這個匿名函式；而第二組小括號中就可以放置這個匿名函式的參數。所以在上面的程式碼中，我們把 Plugin 的程式碼用一個匿名函式包覆起來，然後參數就用我們常用的 `$` 符號；接著在利用前述的原理，將 `jQuery` 這個類別導入給我們的 Plugin ，這樣我們就可以很快樂地在 Plugin 中使用我們熟悉的 `$` 符號了。至於最前面的分號 `;` ，主要是考慮這個 Plugin 檔案會和其他 JS 檔合併壓縮而放進來的。

註： `$` 在 JavaScript 裡是合法的變數名稱。

後面的說明我會略過這個包覆動作，在實際檔案中請別忘了加。

## 加入選項設定

接下來我希望讓 `each` 的 callback 函式能讓使用者自訂，因此我需要一個讓使用者能設定的選項。就像其他的 Plugin 一樣，我們讓我們的 `mytoolbox` 可以接受一個 `settings` 物件：

```js
$.fn.mytoolbox = function(settings) {
    var _defaultSettings = {
        callback: function () {
            alert(this.id);
        }
    };
    var _settings = $.extend(_defaultSettings, settings);
    return this.each(function() {
        $(this).click(_settings.callback);
    });
};

```

首先我們為 Plugin 加入 `settings` 參數，也就是一般 Plugin 常見的設定值。然後則是 `_defaultSettings` ，它能幫我們在使用者沒有指定任何設定值給 `settings` 時，還能夠提供預設的設定值。

接著我用 jQuery 提供的 `extend` 方法，將 `settings` 中有設定的值覆蓋掉 `_defaultSettings` 所設定的預設值，再把結果存放在 `_settings` 這個變數中；後面我們就會用新的 `_settings` 變數當做我們的設定值。

現在我們在 `_settings` 中指定了一個 callback 項目 (預設是用 `alert` ) ，然後將它指定給 div 元素的 `click` 觸發器。現在我要在 HTML 頁面中更改這個事件處理器，使它不再使用 `alert` ，而是把結果顯示在 `div#debug` 裡。程式如下：

```js
$(function () {
    var debug = $('#debug');
    $('.test').mytoolbox({
        callback: function () {
            debug.html(debug.html() + this.id + '<br />');
        }
    });
});

```

再重新瀏覽一次頁面，看看效果是不是依照我們想像的完成呢？

## 修改觸發事件

假設現在我們不想用 `click` ，而是想讓滑鼠移過就觸發 callback 呢？這時就要借重 jQuery 的 `bind` 方法了：

```js
$.fn.mytoolbox = function(settings) {
    var _defaultSettings = {
        bind: 'click',
        callback: function () {
            alert(this.id);
        }
    };
    var _settings = $.extend(_defaultSettings, settings);
    return this.each(function() {
        $(this).bind(_settings.bind, _settings.callback);
    });
};

```

這裡我加入一個 `bind` 設定項目，預設是用 click 事件觸發。回到 HTML 頁面，我們改用 `mouseover` 來觸發 callback ：

```js
$(function () {
    var debug = $('#debug');
    $('.test').mytoolbox({
        bind: 'mouseover',
        callback: function () {
            debug.html(debug.html() + this.id + '<br />');
        }
    });
});

```

重新瀏覽 HTML 頁面，當滑鼠移過 div 元素時，是不是會出現對應的 id 呢？

到這裡，相信大家都應該大致瞭解如何建立一個 jQuery Plugin 了吧？接下來，我將透過實際的例子為大家介紹更多自製 jQuery Plugin 所需要注意的地方。

請觀賞 [Part 2](/2008/05/16/337/) 。

## 參考網址

* [A Plugin Development Pattern](http://www.learningjquery.com/2007/10/a-plugin-development-pattern)
