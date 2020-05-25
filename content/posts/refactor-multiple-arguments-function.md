---
title: '[五分鐘教室] 重構多參數函式'
date: 2009-12-16 00:00:00 +08:00
tags: ["PHP"]
---

我們在撰寫 PHP 函式 (或類別的方法) 時，多少都會帶入一些參數，例如：

```php
function myfunc($arg1, $arg2, ...) {}
```

一般常見的函式，它們的參數數量大多只會兩三個，但如果有參數的數量很多時該怎麼辦？

<!-- more -->

## 多參數的困擾

當一個 PHP 函式的參數多於三個以上時，其實就會浮現一些讓程式開發人員困擾的問題。

### 順序不易記憶

當函式名稱語意不明時，加上如果沒有 IDE 的協助，你會很難瞭解參數的先後順序。

像我自己就很常搞錯 `iconv` 的參數順序：

```php
iconv($in_charset, $out_charset, $str)
```

每次使用時，我都要回去看看官方手冊，才會記得第一個參數是輸入編碼而不是要轉換的字串。

### 預設值

還有一個狀況是參數如果有預設值時，一定是將它放在最右邊的參數。例如 `htmlspecialchars` 這個函式：

```php
htmlspecialchars($string[, $quote_style = ENT_COMPAT[, $charset = 'ISO-8859-1'[, $double_encode = true]]])
```

如果今天我們只想要載入第一個參數 (要轉換的字串) 和第三個參數 (編碼) ，這是做不到的；我們不得不把第二個參數 (引號型態) 也一併代入，即便我們不想更改它的預設值。

## 解決方式

我們可以用關聯式陣列來解決前述的問題，也就是把多個參數變成一個陣列。

例如以前面的 `iconv` 為例，我們自己定義了一個函式將它包裝起來，然後把原來的三個參數變成一個參數陣列：

```php
// 定義
function my_iconv($options)
{
    return iconv($options['inputCharset'], $options['outputCharset'], $options['convertString']);
}

//用法
echo my_iconv(array(
    'convertString' => 'test',
    'inputCharset' => 'BIG5',
    'outputCharset' => 'UTF-8',
));
```

這樣一來，不僅我們不用擔心參數順序的問題，還可以很容易地分辨出每個參數值所代表的意義。

註：這種作法在一些 JavaScript Library 裡也常見到，像是 jQuery 很多方法都是以物件來當做參數組代入。

### 考慮預設值

那麼如果參數需要預設值時該怎麼做呢？這時候我們可以在函式裡預先放置一個含有預設值的陣列，來跟使用者傳入的陣列做合併的動作。例如：

```php
function my_htmlspecialchars($str, $options = array())
{
    $options = (array) $options;
    $options += array(
        'quoteStyle' => ENT_COMPAT,
        'charset' => 'ISO-8859-1',
        'doubleEncode' => true,
    );
    return htmlspecialchars(
        $str,
        $options['quoteStyle'],
        $options['charset'],
        $options['doubleEncode']
    );
}

echo my_htmlspecialchars('<test>測試</test>', array('charset' => 'UTF-8'));
```

這裡我用了「 `+` 」這個可以用來合併陣列的操作符，它會以左邊陣列裡的值為主，然後將右邊的值合併進來。

這樣一來，右邊的陣列裡我們可以放置預設的參數值，而不必擔心使用者沒有帶入中間必要的參數。

註：你也許會發現我沒有把 `$str` 放到 `$options` 裡，這是因為它本身就是必要的參數。

### 缺點

使用關聯式陣列當做參數值也不能說完全沒有缺點，實際應用上我就發現了以下幾個問題：

* 比原本的程式寫法囉嗦了些，你得多打好多字才能達到相同的目的。

* 參數名稱不易記憶，且預設值要寫在註解裡，而不是寫在定義裡；這樣一來有些 IDE 如果不顯示函式註解的話，還是得看手冊才能知道這些參數的名稱與預設值。

## 結論

用關聯式陣列來取代多參數這個方法，最大的好處就是當後續維護的開發人員，可以不必再回頭查看手冊，一眼就能知道每個參數值所代表的意義。

不過這個方法還是得看狀況使用，因為它所帶來的缺點可能會讓很多開發人員覺得很不便。所以在設計函式時，一定要仔細思考如何去定義才能讓開發者方便使用這些它們。
