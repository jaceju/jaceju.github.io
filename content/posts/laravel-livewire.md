---
title: "用 Livewire 在 Laravel 應用裡實現無痛的前後端溝通"
date: 2020-09-08T12:13:15+08:00
tags:
  - Laravel
  - PHP
---

## 緣起

如果今天給網站開發者一個最簡單的題目：「如何在不重整頁面的情況下，讓前端介面可以取得後端資料的狀態？」我相信幾乎所有開發者都能實作出來，畢竟這個機制算是現代網站開發的基礎。

這個題目的答案從概念上來說，就是很簡單的三個步驟：

- 後端送出 HTML 給瀏覽器來呈現網頁。
- 在頁面上用 AJAX 向後端 API 發起請求。
- 在接收到 AJAX 的結果後，將結果呈現到對應的位置上。

當然不僅是取得結果，同樣的方式也可以用在把前端的資料送往後端的業務處理邏輯上。

只不過這背後有很多麻煩事要處理，像是：

- 後端要建立對應前端操作的 API ，並且要顧及安全性 (例如防範 CSRF ) 。
- 前端要透過 XHR 發起要求，並處理 API 各種狀態的結果。
- 需要學習如何操作前端 DOM 元素，讓後端資訊可以綁在元素上或是透過元素的事件來取得元素上的資訊。
- 前端要維護介面狀態，在重新整理頁面後要能後端資料狀態同步。

諸如此類的基礎工夫還不少，雖然現代化的前後端框架或工具都幫我們處理掉了，但實戰上要把它們兜起來還是要花掉不少時間。

有沒有什麼更好的方法，可以讓開發者可以做更少的事，而達到同樣的效果呢？

<!--more-->

[Livewire](https://laravel-livewire.com/) 就是在這個概念下所產生的套件，目的就是為了減少開發者在前後端溝通時要花費的工夫。

這個套件很早我就在 [Laravel News](https://laravel-news.com/laravel-livewire-1-0-0) 裡知道了，只是一直都沒有動力去試試。不過當 Laravel 官方釋出了 [Laravel Jetstream](https://github.com/laravel/jetstream) 這個非常棒的服務平台骨架產生器時，我在研究的時候發現安裝 Jetsteam 的過程中，可以選擇 Livewire 或是 [Inertia.js](https://inertiajs.com/) 。

{{% class note %}}
註： Inertia.js 的概念跟 Livewire 概念很像，也是主打不需要自行建立後端 API (但業務邏輯的撰寫還是必要的) ；不過它是從 SPA (Single Page Application) 的角度出發，著重在前端的開發上。在 IThome 鐵人賽上有[系列文](https://ithelp.ithome.com.tw/users/20113602/ironman/3322)可以參考。
{{% /class %}}

既然官方套件也開始用了，表示 Livewire 不會是曇花一現的技術；因此我就想好好地看看它是怎麼運作的，讓官方選擇它來當做套件的底層機制。

而要瞭解一個工具，最好的方法就是從實作開始。接著我會以官方文件的教學為主，簡單地分析 Livewire 的運作方式。

## 初探 Livewire

由於 Livewire 是依附在 Laravel 應用程式上的機級，所以我們需要在本機建立一個 Laravel 應用程式。

首先我們安裝 Laravel Installer 或是將它升級至 4.0 ：

```bash
$ composer global require laravel/installer
```

接著建立並啟動一個 Laravel 的應用程式服務，這裡我用 Valet (Mac only) 來建立站台，其它環境請自行研究。

```bash
$ laravel new livewire-demo
$ cd livewire-demo
$ valet link && valet secure
```

有了一個乾淨的 Laravel 應用程式環境，我們就可以來試玩一下 Livewire 了。

先安裝 livewire 套件：

```bash
$ composer require livewire/livewire
```

我們看一下新增了什麼 routes ：

```
$ php artisan route:list -c
+----------+----------------------------------+------------------------------------------------------+
| Method   | URI                              | Action                                               |
+----------+----------------------------------+------------------------------------------------------+
| ...      | ...                              | ...                                                  |
| GET|HEAD | livewire/livewire.js             | Livewire\Controllers\LivewireJavaScriptAssets@source |
| GET|HEAD | livewire/livewire.js.map         | Livewire\Controllers\LivewireJavaScriptAssets@maps   |
| POST     | livewire/message/{name}          | Livewire\Controllers\HttpConnectionHandler           |
| GET|HEAD | livewire/preview-file/{filename} | Livewire\Controllers\FilePreviewHandler@handle       |
| POST     | livewire/upload-file             | Livewire\Controllers\FileUploadHandler@handle        |
+----------+----------------------------------+------------------------------------------------------+
```

可以看到它提供了前端 assets 、供前端溝通用的訊息 API 、上傳檔案與檔案預覽的 API 。

不過這些 API 原則上知道就好，在實際開發時因為 Livewire 已經幫我們封裝這些 API 的操作，所以基本上不會看到它們。

然後我們要在 blade template (這裡為 `resources/views/welcome.blade.php` ) 上加入 Livewire 提供的 tag `<livewire:styles />` 與 `<livewire:scripts />` ：

```php
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laravel Livewire Demo</title>
    <!-- Styles -->
    <livewire:styles />
</head>
<body>
<livewire:scripts />
</body>
</html>
```

{{% class note %}}
註： Tag 是 Laravel 7 之後才支援的寫法，如果是 Laravel 6 以前的版本，必須用 `@livewireStyles` 及 `@livewireScripts` 。
{{% /class %}}

接著打開頁面原始碼，我們可以看到 styles 和 scripts 分別被代換成以下 HTML ：

```html
<style>
    [wire\:loading], [wire\:loading\.delay] {
        display: none;
    }

    [wire\:offline] {
        display: none;
    }

    [wire\:dirty]:not(textarea):not(input):not(select) {
        display: none;
    }
</style>
...
<script src="/livewire/livewire.js?id=d3352e4f7c3be3e22a1f"></script>
<script >
    if (window.livewire) {
        console.warn('Livewire: It looks like Livewire\'s @livewireScripts JavaScript assets have already been loaded. Make sure you aren\'t loading them twice.')
    }

    window.livewire = new Livewire();
    window.Livewire = window.livewire;
    window.livewire_app_url = '';
    window.livewire_token = 'syJQNxWSjopRJLvEKlImImypOHrzRLq7MJgArStk';

    /* Make Alpine wait until Livewire is finished rendering to do its thing. */
    window.deferLoadingAlpine = function (callback) {
        window.addEventListener('livewire:load', function () {
            callback();
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        window.livewire.start();
    });
</script>
```

大致上就是 CSS 用來隱藏載入中或離線等狀態的 Livewire 元件，而 JS 除了定義跟後端溝通的連線資訊外，也用來監聽頁面上所有 Livewire 元件的事件；至於細節就不多解釋了，相信大家應該都看得懂。

接著來看看[官方提供的例子]((https://laravel-livewire.com/docs/quickstart))，這裡我們要新增一個手動計數器。

首先用以下指令來建立計數器的元件與樣版：

```bash
$ php artisan make:livewire counter
 COMPONENT CREATED  🤙

CLASS: app/Http/Livewire/Counter.php
VIEW:  resources/views/livewire/counter.blade.php
```

`app/Http/Livewire/Counter.php` 的內容如下：

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;

class Counter extends Component
{
    public function render()
    {
        return view('livewire.counter');
    }
}
```

注意這裡的 `Livewire Component` 跟 Laravel 7 之後的 [Blade Components](https://laravel.com/docs/7.x/blade#components) 的實作是不一樣的，雖然它們的用法基本上很像，但還是別搞混了。

再來看 `resources/views/livewire/counter.blade.php` ，它目前只有一個 `div` 標籤對：

```php
<div>
    {{-- 一句隨機挑選的俚語 --}}
</div>
```

現在我們要讓這個計數器動起來了，第一步是在 `Counter` 類別補上計數器的暫存狀態與行為邏輯：

```php
<?php

// ...

class Counter extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }

    public function decrement()
    {
        $this->count--;
    }

    // ...
}
```

下一步是修改 `counter.blade.php` 的內容：

```php
<div style="text-align: center">
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
    <button wire:click="decrement">-</button>
</div>
```

你會發現我們用 `wire:click` 去綁定後端 `Counter` 類別的 `increment` 和 `decrement` 這兩個方法，這就是 Livewire 主打的核心功能。

現在我們要來使用這個計數器元件了。修改 `resources/views/welcome.blade.php` ，在 `<body>` 後加入 `<livewire:counter />` 這個 tag ：

```php
...

<body>
<livewire:counter />

...
```

接著重整瀏覽器頁面，你應該會看到以下畫面：

![](/resources/laravel-livewire/counter.png)

再看看頁面原始檔，你會發現 `counter.blade.php` 的 `div` 標籤多了一些屬性：

```html
<div wire:id="VhVG7h01POBNuWMvpaVx"
     wire:initial-data="{&quot;fingerprint&quot;:{&quot;id&quot;:&quot;VhVG7h01POBNuWMvpaVx&quot;,&quot;name&quot;:&quot;counter&quot;,&quot;locale&quot;:&quot;en&quot;},&quot;effects&quot;:{&quot;listeners&quot;:[],&quot;path&quot;:&quot;https:\/\/livewire-demo.test&quot;},&quot;serverMemo&quot;:{&quot;children&quot;:[],&quot;errors&quot;:[],&quot;htmlHash&quot;:&quot;31258d01&quot;,&quot;data&quot;:{&quot;count&quot;:0},&quot;checksum&quot;:&quot;2ed61de3befc848b43c1cb84eb3bf9f2a65cae1586c1631bc4d49efa284ab3ac&quot;}}" style="text-align: center">
    <button wire:click="increment">+</button>
    <h1>0</h1>
    <button wire:click="decrement">-</button>
</div>
```

`wire:id` 是元件的唯一識別，假設頁面有多個計數器， `wire:id` 能讓 Livewire 知道目前我們操作的是哪一個計數器。

再把屬性 `wire:initial-data` 裡的 `&quot;` 替換成 `"` 後再排版一下就可以得到：

```json
{
  "fingerprint": {
    "id": "VhVG7h01POBNuWMvpaVx",
    "name": "counter",
    "locale": "en"
  },
  "effects": {
    "listeners": [],
    "path": "https://livewire-demo.test"
  },
  "serverMemo": {
    "children": [],
    "errors": [],
    "htmlHash": "31258d01",
    "data": {
      "count": 0
    },
    "checksum": "2ed61de3befc848b43c1cb84eb3bf9f2a65cae1586c1631bc4d49efa284ab3ac"
  }
}
```

這就是 Livewire 用來讓前端可以跟後端溝通的資訊，而且其中也加上一些防止修改的措施，畢竟「**不要相信用戶端來的所有資訊**」是後端開發的重要觀念之一。

接下來打開瀏覽器的除錯工具，觀察跟 XHR 有關的網路連線。然後按一下頁面上的按鈕 `+` 來讓數字發生變化，這時候我們就會看到 Livewire 觸發了一個 XHR 的連線，它打到以下這個 API ：

```
[POST] https://livewire-demo.test/livewire/message/counter
```

這就是我們上面看到那個指向 `livewire/message/{name}` 的 Laravel route 。

而它的 request payload 長這樣：

```json
{
  "fingerprint": {
    "id": "VhVG7h01POBNuWMvpaVx",
    "name": "counter",
    "locale": "en"
  },
  "serverMemo": {
    "children": [],
    "errors": [],
    "htmlHash": "31258d01",
    "data": {
      "count": 0
    },
    "checksum": "2ed61de3befc848b43c1cb84eb3bf9f2a65cae1586c1631bc4d49efa284ab3ac"
  },
  "updates": [
    {
      "type": "callMethod",
      "payload": {
        "method": "increment",
        "params": []
      }
    }
  ]
}
```

可以發現到它丟了一個 `increment` 方法名稱給後端。也就是說 Livewire 並不是在前端進行運算，而是透過 XHR 傳遞方法名稱來要求後端的計數器元件對 `count` 值進行計算。

要特別注意，這時候 Livewire 是用**前端的 `count` 值**加上要呼叫的方法 `increment` 給後端的運算邏輯，來讓 `count` 值加一；如果不搭配存儲機制的話 (例如 Session / DB 等) ，後端並不會記住目前的計數器的 `count` 值，所以重新整理頁面後它就會還原回元件的初始值。

最後來看看回應的內容：

```json
{
  "effects": {
    "html": "<div wire:id=\"VhVG7h01POBNuWMvpaVx\" style=\"text-align: center\">\n    <button wire:click=\"increment\">+</button>\n    <h1>1</h1>\n    <button wire:click=\"decrement\">-</button>\n</div>\n",
    "dirty": [
      "count"
    ]
  },
  "serverMemo": {
    "htmlHash": "fbf6038e",
    "data": {
      "count": 1
    },
    "checksum": "6685b4e7d45f9c4db431e5c267eed759eae1c950096ced91feccfc94cd109411"
  }
}
```

在計數器的運算完成後，就會將 blade 樣版套用新變數結果後所產生的 HTML 內容回傳，並取代掉目前元件的 HTML 。

至此，大致上可以瞭解 Livewire 的運作流程其實跟我們平常做的事沒什麼差別，只不過 Livewire 封裝了背後的細節，使其更為自動化，讓開發者可以更專注在自己的業務邏輯上。當然如果大家對細節有興趣的話，可以參考官方文件或原始檔。


## 優缺點分析

雖然還沒玩得很深，不過大致上可以想到 Livewire 有以下的優點：

- 簡單的情境幾乎不需要寫 JavaScript 。
- 元件的狀態由後端管理，前端的工變少，適合對前端不那麼熟悉的後端開發者。

只是就我的經驗來判斷，它也可能有以下的缺點：

- 一些跟後端邏輯無關的複雜前端 UI 或機制，可能還是需要藉助其它 UI 框架或套件來協助。
- 複雜的 UI 元件切法和後端元件的搭配可能要花點時間理解。
- 因為前後端的界線變得模糊，會容易讓新手搞混前後端的運作機制。

當然這也只是我淺嘗後的印象，也許再深入一點之後，可能又會有不同的見解。

## 結論

不得不說 Livewire 真的是一個可以節省開發者不少力氣的有趣工具；當然它所應用的概念我想也不是新的，只不過對於傳統 Laravel 開發者來說，確實可能一下子難以接受。現階段如果要導入 Livewire ，我建議從比較功能比較簡單，情境沒有那麼複雜的新專案開始，去熟悉它的運作方式和缺點。

本文只是非常簡單地介紹了 Livewire 的概念和用法，我知道各位心中對它還有很多疑問，這些你都可以試著從官方文件和 issue 中找答案。至於更進一步的應用方式，當然就是推薦 Laravel 官方釋出的 [Laravel Jetstream](https://github.com/laravel/jetstream) 。

## 參考

- [Laravel Livewire::Quickstart](https://laravel-livewire.com/docs/quickstart)
- [Laravel livewire installation and demo](https://medium.com/@avnshrathod/laravel-livewire-installation-and-demo-dfaf930f5f64)
- [Laravel Livewire CRUD tutorial](https://laravelarticle.com/laravel-livewire-crud-tutorial)