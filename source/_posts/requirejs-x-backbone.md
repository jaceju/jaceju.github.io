---
layout: post
title: "利用 RequireJs 將 Backbone.js 程式模組化"
date: 2012-04-12 14:10
comments: true
tags: ["Backbone.js", "RequireJS"]
---

之前分享了[初探 Require.JS](http://www.jaceju.net/blog/archives/beginning-requirejs/)一文後，對 RequireJS 已經有一定的瞭解，但後來實際應用到 Backbone.js 程式上時，發現了一些要特別注意的事項。

以下便是我在整合兩者時的筆記。

<!--more-->

## baseUrl 選項

在 [初探 Require.JS](http://www.jaceju.net/blog/archives/beginning-requirejs/) 的範例中，我是這樣寫的：

``` javascript js/main.js
require({
  paths: {
    "order": "../lib/requirejs/order",
    "lib": "../lib"
  }
});

require([
  'app',
  'order!lib/jquery/jquery-min',
  'order!lib/underscore/underscore-min',
  'order!lib/backbone/backbone-min'
], function (App) {
  App.initialize();
});
```

事實上這會影響我們在用 `r.js` 時的編譯，所以第一步我們先加上 baseUrl 選項：

``` javascript js/main.js
require({
  baseUrl: './',
  paths: {
    order: 'lib/requirejs/order',
  }
});

require([
  'js/old_app',
  'order!lib/jquery/jquery-min',
  'order!lib/underscore/underscore-min',
  'order!lib/backbone/backbone-min'
], function (App) {
  App.initialize();
});
```

`baseUrl` 是指讓 RequireJS 搜尋模組路徑時的起始位置；如果是用 `./` 的話，指的就是 index.html 所在的網址。

這樣一來我們就不用設定 `lib` 的別名了。

註：接下來的範例裡，除非必要，否則將不會特別提到選項的部份。

## 第三方套件載入時機

先前我們的 `js/app.js` 是這樣寫的：

``` javascript js/app.js
define(function () {
  return {
    initialize: function () {
      var Model = Backbone.Model.extend({
        // ...
      });
      var View = Backbone.View.extend({
        // ...
      });
      var model = new Model();
      var view = new View({
        model: model
      })
    }
  }
});
```

在 `initialize` 方法裡我把所有的程式碼都塞在這裡，而當我想把 model/view 分離出來時，卻遇到了很大的難題。

首先我想把 Model 分離出來，所以加入一個 `js/model/Model.js` 如下：

``` javascript js/model/Model.js
define(function () {
  return Backbone.Model.extend({
    // ...
  });
});
```

然後把 `js/app.js` 改寫成：

``` javascript js/app.js
define([
  'js/model/Model'
], function (Model) {
  return {
    initialize: function () {
      var View = Backbone.View.extend({
        // ...
      });
      var model = new Model();
      var view = new View({
        model: model
      })
    }
  }
});
```

重新執行，結果瀏覽器告訴我： `Backbone is not defined` 。

怎麼回事呢？

原因是 js 檔案的載入順序，以及 factory 執行的時機。我們來分析一下整個程式的載入流程：

1. 載入 js/app.js 。
1. 載入 js/model/Config.js 。
1. 執行 js/model/Config.js 的工廠方法。
1. 載入 jQuery 。
1. 載入 underscore.js 。
1. 載入 Backbone.js 。
1. 執行 js/app.js 的工廠方法。
1. 執行 js/app.js 的 `initialize` 方法。

還記得 `define` API 會在相依的模組完載入後就執行工廠方法嗎？

這裡我們的 `js/model/Config.js` 因為沒有指定相依模組，所以載入後就會直接執行其工廠方法。但是因為 Backbone.js 等第三方套件還沒載入，所以在第三個步驟時，瀏覽器就噴錯誤給我們了。

怎麼解決呢？第一個方法是把 `js/main.js` 中的 `'js/app'` 移到第三方套件後載入，不過得再加入不必要的 namespace ：

``` javascript js/main.js
require([
  'order!lib/jquery/jquery-min',
  'order!lib/underscore/underscore-min',
  'order!lib/backbone/backbone-min',
  'order!js_1/app',
], function (_jQuery, _Underscore, _Backbone, App) {
  App.initialize();
});
```

註：要記得相依的 js 模組會與 callback 的參數從左至右一一對應。

這樣確實就可以讓模組依照我們相要的順序依序載入了。

不過那些用不到的 namespace 真的很礙眼，還好 JavaScript 可以讓我們不需要寫它們；我們直接改用 `arguments` 來將 `App` 載入：

``` javascript js/main.js
require([
  'order!lib/jquery/jquery-min',
  'order!lib/underscore/underscore-min',
  'order!lib/backbone/backbone-min',
  'order!js/app',
], function () {
  App = _.last(arguments);
  App.initialize();
});
```

這樣就看不到那些無用的 namespace 了。

## 物件還是建構式

仔細比較 `js/app.js` 與 `js/model/Model.js` ，一個是回傳純物件 `{...}` ，一個是回傳 `Backbone.Model.extend({...})` ，這兩者有什麼不同呢？

純物件的方式，我們可以直接使用它的方法：

```
App.initialize();
```

而 `Backbone.Model.extend({...})` 回傳的則是一個建構函式，我們要用 `new` 關鍵字來使用它：

``` javascript js/app.js
define([
  'js/model/Model'
], function (Model) {
  return {
    initialize: function () {
      var model = new Model();
    }
  }
});
```

另外千萬不要直接回傳 new 之後的 Model 或是 View ，也就是：

``` javascript js/model/Model.js
define(function () {
  return new Backbone.Model.extend({
    // ...
  });
});
```

因為這樣一來回傳的是物件，而非建構函式，開發上就會造成問題。

## 錯誤的 order plugin 用法

RequireJS 的 order plugin 可以讓我們依序載入模組，但它卻還是有所限制。

假設我把前面的第三方套件放到 `js/vendor.js` 裡面：

``` javascript js/vendor.js
define([
  'order!lib/jquery/jquery-min',
  'order!lib/underscore/underscore-min',
  'order!lib/backbone/backbone-min',
], function () {});
```

然後把 `js/main.js` 改成：

``` javascript js/main.js
require([
  'order!js/vendor',
  'order!js/app',
], function (Vendor, App) {
  App.initialize();
});
```

這時我發現程式處於一種不穩定的狀態，也就是時好時壞。

這是因為我們使用的是非同步載入的方式，但 order plugin 只能確保同一個檔案裡的載入順序，當跨到不同檔案時， order plugin 就會失效了。

## r.js 注意事項

原本以為 `r.js` 能夠取用 `js/main.js` 裡的設定，但後來測試的結果是不行。所以在使用 `r.js` 編譯檔案時，如果有以下的設定：

``` javascript js/main.js
require({
  baseUrl: './',
  paths: {
    order: 'lib/requirejs/order',
    text: 'lib/requirejs/text'
  }
});
```

那麼在下 `r.js` 指令時，就要把它們都加入：

```bash
r.js -o \
name=js/main \
out=js/main-built.js \
baseUrl="./" \
paths.order="lib/requirejs/order" \
paths.text="lib/requirejs/text"
```

這樣一來，才能編出正確的單一壓縮 js 檔案。

不過每次要下這麼長的指令還真麻煩，還好 `r.js` 也提供了方便的用法，就是建立一個 build profile ；我們只需要在專案根目錄加上一個 `build.js` ：

``` javascript build.js
({
  baseUrl: './',
  name: 'js/main',
  out: 'main-built.js',
  paths: {
    order: 'lib/requirejs/order',
    text: 'lib/requirejs/text'
  }
})
```

然後利用 `build.js` 來重新最佳化：

```bash
r.js -o build.js
```

效果就是一樣的了。

build profile 的其他選項請參考官方提供的 [build.js 範例](https://github.com/jrburke/r.js/blob/master/build/example.build.js)。

## text plugin

RequireJS 提供了一個很棒的非同步樣版載入模組，名為 `text` ；它可以幫我們把外部的 html 檔案載入，並當做字串使用。用法如下：

``` javascript js/view/View.js
define([
  'text!template/view_template.html'
], function (viewTemplate) {
  return Backbone.View.extend({
    initialize: function () {
      this.$el.html(viewTemplate);
    },
  });
});
```

註： `text` 是 `lib/requirejs/text` 的別名。

有趣的是，它在透過 `r.js` 編譯時，就會把樣版檔直接編譯為字串，而不再經外部載入。

假設 `template/view_template.html` 的內容為：

``` html template/view_template.html
<p>This is template.</p>
```

那麼透過 `r.js` 編譯後的結果如下： (已經有重新格式化)

```js
/* other modules */, define("text!template/view_template.html", [], function () {
  return "<p>This is template.</p>"
}), define("js/view/View", ["text!template/view_template.html"], function (a) {
  return Backbone.View.extend({
    initialize: function () {
      this.$el.html(a)
    }
  })
})
```

從上面的範例就可以看到 text plugin 把 `template/view_template.html` 變成一個會回傳字串的模組了。
