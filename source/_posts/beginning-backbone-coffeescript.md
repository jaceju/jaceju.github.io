---
layout: post
title: "Beginning Backbone.JS X CoffeeScript"
date: 2011-11-22 22:28
comments: true
permalink: /blog/archives/beginning-backbone-coffeescript
tags: ["CoffeeScript", "Backbone.js"]
---
因為想同時練習 Backbone.JS 和 CoffeeScript 這兩個熱門的技術，所以在網路上找了一下，剛好看到這篇 [CoffeeScript with Backbone.js Example](http://sunilarora.org/coffeescript-with-backbonejs-example) ，所以快速做個筆記。

這篇文章的範例主要是讓我們可以同時更改所有方塊的顏色和尺寸，只要在上方的文字欄位中輸入顏色與尺寸值即可。

以下就針對實做這篇文章時所碰到的一些問題以及實作上的心得，一一做整理。

<!-- more -->

## HTML

首先來看一下 HTML 的組成：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Backbone &amp; CoffeeScript</title>
    <meta charset="UTF-8" />
  </head>
  <body>

    <!-- Interface -->
    <div id="config-input" style="padding: 20px;">
      <div data-role="fieldcontain">
        <label for="text" >Enter Color Value (ex. red, green) :</label>
        <input id="color-input" type="text" value="blue" />
      </div>
      <div data-role="fieldcontain">
        <label for="text" >Enter Width of the box (ex. 50, 70) :</label>
        <input id="width-input" type="text" value="100" />
      </div>
    </div>
    <ul id="color-boxes" style="display: inline; list-style-type:none;"></ul>

    <!-- Template -->
    <script type="text/x-jquery-tmpl" id="color-box-template">
      <div style="margin: 20px; float: left;height:${width}px; width: ${width}px; background-color: ${color}; border: 2px solid;">
      </div>
    </script>

    <!-- Scripts -->
    <script src="js/jquery.js"></script>
    <script src="js/underscore.js"></script>
    <script src="js/backbone.js"></script>
    <script src="js/jquery.tmpl.js"></script>
    <script src="js/app.js"></script>

  </body>
</html>
```

在這次的範例裡把 HTML 分成三個部份：輸出入介面、樣版、 JavaScript 。

介面有輸入用的 `#config-input` 及輸出用的 `#color-boxes` ，樣版 `#color-box-template` 則是用來輸出方塊用。

JavaScript 的部份有用到：

* [jQuery](http://jquery.com)
* [underscore.js](http://documentcloud.github.com/underscore/)
* [Backbone.js](http://documentcloud.github.com/backbone/)
* [jQuery Template Plugin](http://api.jquery.com/jquery.tmpl/)
* app.js (app.coffee) - 就是下面要看的部份。

接下來就一一來分析 `app.coffee` 的內容。

## 繼承 Backbone 的類別

原本 Backbone 的類別都已經有提供 extend 這個方法，它讓我們用以下的方法來建立我們的類別：

```coffeescript
ConfigModel = Backbone.Model.extend
    defaults:
    initialize: ->

ColorBoxView = Backbone.View.extend
    tagName: "li"
    initialize: ->
    render: =>
```

但是它其實跟 CoffeeScript 提供的 `extends` 敘述做的事是一樣的，所以我們可以將上例改寫成 CoffeeScript 的 class ：

```coffeescript
class ConfigModel extends Backbone.Model
    initialize: ->

class ColorBoxView extends Backbone.View
    tagName: "li"
    initialize: ->
    render: =>
```

## Model

這個範例的 Model 很簡單，就是一個單純的 Value Object ，並在物件初始化時設定初值：

```coffeescript
class ConfigModel extends Backbone.Model
    initialize: ->
        @set 'color': 'blue', 'width': '100', 'height': '100'
```

或是這樣寫也可以：

```coffeescript
class ConfigModel extends Backbone.Model
    initialize: ->
        @set
            color: 'blue'
            width: 100
            height: 100
```

也可以改用定義 `defaults` 屬性：

```coffeescript
class ConfigModel extends Backbone.Model
    defaults:
        color: 'blue'
        width: 100
        height: 100
```

註： `initialize` 及 `defaults` 是 `Backbone.Model` 的屬性，不是 CoffeeScript 的語法。

這裡的 Model 只負責存住值，然後讓 View 可以來更新它的狀態，或是參考它來更新 View 的狀態。

## View

這個範例有兩個 View ，一個是輸入設定值的介面，一個是用來呈現方塊的結果。

首先先來看輸入設定值的介面：

```coffeescript
class ConfigInputView extends Backbone.View
    events:
        'keyup #color-input': "updateConfig"
        'keyup #width-input': "updateConfig"

    updateConfig: (e)=>
        @model.set
            'color': $('#color-input').val()
            'width': $('#width-input').val()
            'height': $('#width-input').val()
```

`ConfigInputView` 類別定義了兩個 keyup 事件：輸入顏色，以及輸入尺寸；當這兩個事件觸發時，就會呼叫 `updateConfig` 這個方法。

而 `updateConfig` 方法就是用來更新 model 的狀態，相信程式很容易看懂。

`ConfigInputView` 所對應的 HTML 為：

```html
<div id="config-input" style="padding: 20px;">
  <div data-role="fieldcontain">
    <label for="text" >Enter Color Value (ex. red, green) :</label>
    <input id="color-input" type="text" value="blue" />
  </div>
  <div data-role="fieldcontain">
    <label for="text" >Enter Width of the box (ex. 50, 70) :</label>
    <input id="width-input" type="text" value="100" />
  </div>
</div>
```

在輸出的部份，這裡是定義在 `ColorBoxView` 這個類別裡。

```coffeescript
class ColorBoxView extends Backbone.View
    tagName: 'li'
    initialize: ->
        @template = $('#color-box-template').template()
        @model.bind 'change', @render

    render: =>
        $(@el).html $.tmpl @template, @model.toJSON()
        return @
```

`tagName` 是告訴 View 物件要輸出哪一種 HTML 元素，這裡為 li 。

而 `ColorBoxView` 物件在初始化時，會做兩件事：讀取樣版，然後監聽 model 的 `change` 事件。

當 model 的 `change` 事件發生時 (也就是值改變了) ， `render` 方法就會被呼叫，它會用剛剛讀取進來的樣版來重新繪製新的方塊。

`ColorBoxView` 所對應的 HTML 為：

```html
<ul id="color-boxes" style="display: inline; list-style-type:none;"></ul>
<script type="text/x-jquery-tmpl" id="color-box-template">
  <div style="margin: 20px; float: left;height:${width}px; width: ${width}px; background-color: ${color}; border: 2px solid;">
  </div>
</script>
```

## No Controller

Backbone 在 0.5.0 版後，把 Controller 改名為 Router 了，因此我們不能再使用 `Backbone.Controller` 這個類別。

不過這次練習的範例並沒有特別要用到 Router 的功能，因此可以直接建立一個不繼承任何類別的偽 Router 類別，然後在它的 constructor 中初始化我們的 Model 與 View ：

```coffeescript
class ColorBoxRouter
    constructor: ->
        model = new ConfigModel
        color_input = new ConfigInputView
            'el': $('#config-input')
            'model': model
        for x in [1..5]
            view = new ColorBoxView model: model
            $('#color-boxes').append view.render().el
```

註：不過如果未來有需要用到 Router 的功能時，當然還是可以繼承 `Backbone.Router` 。

在初始化 `ConfigInputView` 物件時，其中 el 就會指向這個 View 所對應的 DOM Tree ，而 model 就是對應到我們已經初始化好的 `ConfigModel` 物件。

接著我們建立 5 個方塊，每個方塊都是預設的藍色及 100x100 的尺寸大小；最後把這些方塊一一加到 `#color-boxes` 這個 UL 元素上。

## Run

最後要啟動程式時，只要初始化一個 `ColorBoxRouter` 物件就可以了：

```coffeescript
$(-> cbl = new ColorBoxRouter)
```

## 心得

Backbone.JS 利用了 Observer 這個 Pattern ，讓我們很容易實作出 Model / View 分離的應用程式。而且在架構上也利用了 MVC 分層，使得程式不會陷在一堆 callback 及 global variables 裡。

而 CoffeeScript 也讓我們可以用簡潔的語法，來撰寫複雜而強大的 JavaScript 程式碼。這兩者的搭配，真的讓我有重新認識 JavaScript 的感覺。

能在有生之年，一直學到新東西，真是太棒了！
