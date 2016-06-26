---
layout: post
title: "CSS3 動畫基礎"
date: 2014-06-03 10:28:36 +0800
comments: true
tags: CSS
---
註：本文為作者發表於 OpenFoundry 之 [CSS3 動畫基礎](http://www.openfoundry.org/en/tech-column/9233-css3-animation)一文的備份。

<script async src="//codepen.io/assets/embed/ei.js"></script>

在 JSConf.Asia 2013 ， Lea Verou 介紹了 [CSS in the 4th dimension](http://lea.verou.me/css-4d/#intro)  ([影片](https://www.youtube.com/watch?v=NTJUFQmHbvc)) ，引發了整個 Web 界對 CSS 動畫的期盼；在 [CSS動畫簡介](http://www.ruanyifeng.com/blog/2014/02/css_transition_and_animation.html)一文也已經把重點整理好了。

以下我們將會介紹主要兩個 CSS3 在動畫的屬性： Transition 與 Animation ，並配合實例來練習這些技術，後面我也會介紹一些不錯的相關開發工具。

<!--more-->

## Transition

在以往 HTML 元素在兩種外觀之間的變換，只能從一種外觀直接跳到另一種外觀，瀏覽者並沒有辦法感受到這兩種外觀中間平滑的轉換，造成了視覺上的不適。

<p data-height="268" data-theme-id="0" data-slug-hash="gwyao" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/gwyao/'>例：在滑鼠移過時，方塊的高度和寬度變化。</a></p>

### 基本的 transition

而 CSS 為了補足這方面的視覺轉換特效，特別加入 `transition` 屬性。 一個簡易的動畫效果就是在想要變化的狀態上，加入一個 `transition` 屬性，而其值為變化需歷時的秒數。

```css
div:hover {
    ...
    transition: 1s;
}
```

這麼一來， `transition` 就會自動幫我們補足中間的過場動畫。例如我們希望上面的例子能平順地轉換，歷時一秒：

<p data-height="268" data-theme-id="0" data-slug-hash="AGiEa" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/AGiEa/'>例：加入 transition 後的效果</a></p>

我們也可以讓高度以外的屬性有動畫效果，例如顏色：

<p data-height="268" data-theme-id="0" data-slug-hash="pwgnc" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/pwgnc/'>例：用 transition 改變顏色</a></p>

### `transition` 屬性詳解

`transition` 屬性其實跟 `font` 或 `background` 屬性一樣是簡寫屬性，它是以下四個屬性的總和：

* `transition-property`: 要做變換的 CSS 屬性
* `transition-duration`: 變換需要的時間，單位為 `s` 或 `ms`
* `transition-delay`: 延遲多久後開始變換，單位為 `s` 或 `ms`
* `transition-timing-function`: 稱為 Timing Funciton ，用名稱來定義變換時的加速度。

這些屬性可以分開寫，也可以將它們的值同時寫在 `transition` 屬性裡；唯一要注意的是 `transition-duration` 與 `transition-delay` 的值寫在一起時有前述的順序關係。前面例子中的 `transition: 1s` ，其 `1s` 即為 `transition-duration` 的值。

### `transition-property` 可使用 transition 的屬性

不是所有 CSS 屬性都可以使用 `transition` ，可以參考這篇 [CSS animated properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties) 得知有哪些屬性可以使用 `transition` 。

`transition` 預設是對所有可套用的屬性做轉場效果，也就是關鍵字 `all` ；但其實也可以只針對某個屬性做 `transition` 變化，其他屬性則維持原來的直接變化。

<p data-height="268" data-theme-id="0" data-slug-hash="zpcEG" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/zpcEG/'>例：只對單一屬性加入 transition</a></p>

### 針對不同屬性同時做 transition

如果希望對兩個以上的屬性做 `transition` ，可是又不希望影響其他屬性時，可以用逗號 `,` 將要做 transition 的屬性分隔開來。

<p data-height="268" data-theme-id="0" data-slug-hash="ifbIG" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/ifbIG/'>例：對不同屬性同時做 transition</a></p>

### `transition-delay` 延遲變換

有時候我們需要先變換一個屬性，再變換另一個屬性，這時候就需要對後者加入一個延遲時間；它需要加在原先我們定義好的歷時時間之後。

<p data-height="268" data-theme-id="0" data-slug-hash="xneaw" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/xneaw/'>例：先變換一個屬性，再變換另一個屬性</a></p>

### `transition-timing-function` Timing Funciton

Timing Funciton 包含數種模式，下圖可以看出它們的加速度曲線。

![](http://letrainde13h37.fr/wp-content/uploads/2012/09/trTimingFn.png)

* `linear`: 匀速
* `ease`: 急加速後減速 (預設值)
* `ease-in`: 加速
* `ease-out`: 减速
* `ease-in-out`: 較平緩的 `ease`
* `cubic-bezier`: 自定義速度模式

### cubic-bezier 函式

利用貝茲曲線函式來定義加速曲線，可以直接使用線上工具 <a href="http://cubic-bezier.com/" target="_blank">cubic-bezier()</a> 來找出需要的數值。

### 雙向的 transition

Transition 的效果只會作用在有加入 `transition` 屬性的那個狀態，一旦要回復至原來的狀態時，就會失去 Transition 的平順效果了。這時我們需要對原先的狀態，也加入 `transition` 。

<p data-height="268" data-theme-id="0" data-slug-hash="JhIux" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/JhIux/'>例：雙向的 transition</a></p>

### Transition 的限制

`transition` 的開始和結束都必須是具體數值；例如以下的 CSS 屬性值之間是無法被計算的，就無法使用 `transition` ：

*  `height: auto` (不確定的值) 至 `height: 100px` (具體數值)
*  `display: none` 至 `display: block`
*  `background: url(foo.jpg)` 至 `background: url(bar.jpg)`

<p data-height="268" data-theme-id="0" data-slug-hash="DgFKd" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/DgFKd/'>例： transition 無法作用的狀況</a></p>

另外 `transition` 需要事件來觸發它的動作，所以沒辦法在一進頁面自動產生效果。所以如果不透過 JavaScript 事件處理的話，就只能配合與事件有關的 Pseudo Classes (偽類別，即 `:hover` 、 `:focus` 等) 來呈現效果了。

<p data-height="268" data-theme-id="0" data-slug-hash="jAaxk" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/jAaxk/'>例：搭配 :focus 偽類別</a></p>

### 搭配 jQuery

如果搭配 jQuery 等可以操作 DOM 元素的 library ，我們就可以做更複雜的操作。

<p data-height="300" data-theme-id="0" data-slug-hash="lcCHb" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/lcCHb/'>例：透過切換 class 來做 transition</a></p>

### 瀏覽器支援

目前包含 IE 10+ 的主流瀏覽器都已經支援 `transition` ，可參考 [Can I use](http://caniuse.com/#search=transition) 。

## Animation

雖然 `transition` 屬性簡單易用，但也有上述的侷限。因此就有了 `animation` 這個屬性來彌補其不足。

### 基本的 Animation

最基本的 `animation` 要指定動畫持續的時間，還有動畫的名稱。

```css
div:hover {
  animation: 1s fat;
}
```

而動畫的定義則是用 `@keyframes` 這個屬性，例如：

```css
@keyframes fat {
  0% { width: 100px; }
  50% { width: 150px; }
  100% { width: 200px; }
}
```

在 `@keyframes` 中可以定義多個狀態，範圍可從 `0%` 至 `100%` 。另外 `0%` 可寫成 `from` ， `100%` 可寫成 `to` ，其他狀態還是使用數字百分比。

<p data-height="268" data-theme-id="0" data-slug-hash="pyngJ" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/pyngJ/'>例：基本的 animation</a></p>

### `animation` 屬性詳解

`animation` 屬性和 `transition` 屬性一樣，都是簡寫屬性。它代表以下屬性的總和：

* `animation-name`: 動畫名稱
* `animation-duration`: 播放一次動畫需要的時間，單位為 `s` 或 `ms`
* `animation-timing-function`: 動畫的加速度曲線
* `animation-delay`: 延遲多久後啟始動畫
* `animation-iteration-count`: 動畫播放次數，可用 `infinite`
* `animation-direction`: 動畫播放方向
* `animation-fill-mode`: 指定動畫播放前後的狀態
* `animation-play-state`: 指定動畫播放或暫停

其中 `animation-duration` 、 `animation-timing-function` 、 `animation-delay` 可參考上面 `transition` 相似屬性的介紹。

### `animation-iteration-count` 播放次數

預設 `animation` 和 `transition` 一樣只會動作一次，但我們可以加入數字來指定動畫效果播放的次數。

<p data-height="268" data-theme-id="0" data-slug-hash="lqCjD" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/lqCjD/'>例：指定 animation 的播放次數</a></p>

或是以 `infinite` 這個關鍵字來無限次播放。

<p data-height="268" data-theme-id="0" data-slug-hash="fybqJ" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/fybqJ/'>例：無限次播放 animation</a></p>

### `animation-direction` 播放方向

所謂的播放方向是指從動畫效果 0% 到 100% 的方向，同時也是預設的 `normal` 值。可供設定的值如下：

* `normal` ：每次播放都是從 0% 至 100%
* `reverse` ：每次播放都是從 100% 至 0%
* `alternate` ：播放兩次以上的話，會從 0% 至 100% ，再從 100% 回到 0% ，以此類推
* `alternate-reverse` ：跟 `alternate` 相反，會先從 100% 開始播放

`animation-direction: reverse` ：

<p data-height="268" data-theme-id="0" data-slug-hash="vBtAd" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/vBtAd/'>例：animation 播放方向 reverse</a></p>

`animation-direction: alternate` ：

<p data-height="268" data-theme-id="0" data-slug-hash="bwkCf" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/bwkCf/'>例：animation 播放方向 alternate</a></p>

`animation-direction: alternate-reverse` ：

<p data-height="268" data-theme-id="0" data-slug-hash="kCfAE" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/kCfAE/'>例：animation 播放方向 alternate-reverse</a></p>

### `animation-fill-mode` 動畫播放前後的狀態

如果想要控制動畫播放完後的最終狀態，可以用 `animation-fill-mode` 屬性，它可設定的值如下：

* `none` ：回到未播放動畫效果前的狀態
* `forwards` ：停在動畫的最後一個狀態上
* `backwards` ：停在動畫的第一個狀態上 (實測不出來)
* `both` ：視 `animation-direction` 來決定停在哪一個狀態上。

<p data-height="268" data-theme-id="0" data-slug-hash="fazAe" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/fazAe/'>例：指定 animation 播放後的狀態 forwards</a></p>

註： `backwards` 這個值我在 Chrome 和 Firefox 都試不出來。

### `animation-play-state` 指定動畫播放或暫停

`animation-play-state` 有兩個屬性值： `running` 及 `paused` ，其中 `running` 是預設值。

這個屬性必須獨立定義，無法被放在 `animation` 屬性裡。

<p data-height="268" data-theme-id="0" data-slug-hash="HhGqj" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/HhGqj/'>例：決定 animation 執行或暫停</a></p>

### 瀏覽器支援

`animation` 屬性目前在 IE 10+ 以上主流瀏覽器都可以執行，但採用 Webkit 引擎的瀏覽器必須加上 `-webkit-` 前綴字串。

```css
div:hover {
  -webkit-animation: 1s name;
  animation: 1s name;
}

@-webkit-keyframes name {
    ...
}

@keyframes name {
    ...
}
```

## 實例

接下來我們用 Animation 搭配 Transform 來做簡單的旋轉動畫。 Transform 是用來讓 HTML 元素變形的屬性，雖然跟動畫沒有直接的關係，但它是可以套用動畫效果的。這邊我不打算詳細介紹它，只會用到旋轉的效果。

它的語法如下：

```css
div {
    transform: rotate(θ);
    transform-origin: x y;
}
```

`rotate(θ)` 是指讓指定元素以參考點為中心軸 2D 旋轉 θ 度， `transform-origin` 會將 `(x, y)` 設為參考點。當我們把 `transform: rotate(θ)` 放到 `@keyframes` 中時， `animation` 就會改變 `θ` 值來做出動畫效果。

以下模擬簡單的太陽、地球、月亮的週期變化。

<p data-height="600" data-theme-id="0" data-slug-hash="gkdBx" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/gkdBx/'>範例：模擬太陽、地球、月亮的週期</a></p>

更酷的範例參考：

* [20 stunning examples of CSS3 animation](http://www.creativebloq.com/css3/animation-with-css3-712437)
* [Our Solar System](http://neography.com/experiment/circles/solarsystem/)
* [30 Best Creative CSS3 Animation Examples](http://designscrazed.com/css3-animation-examples/)
* [Codepen.io CSS Animation](http://goo.gl/SHWmEx)

## 開發工具

### CSS 3.0 Maker

[CSS 3.0 Marker](http://www.css3maker.com) 可以讓我們調整 CSS3 相關屬性的參數，並預覽效果。確認後就可以產生對應的 CSS 碼，套用到專案上。

### Animate.css

[Animate.css](http://daneden.github.io/animate.css/) 這個 CSS framework 提供很多組已經定義好動畫效果的 CSS class ，讓我們可以直接套在 HTML 元素上，或是搭配 jQuery 來操作 class 來產生動畫效果。

<p data-height="268" data-theme-id="0" data-slug-hash="pDblC" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/pDblC/'>範例： Animation.css</a></p>

### Animate Mixin for Compass/SASS

[Animate Mixin for Compass/SASS](http://thecssguru.freeiz.com/animate/) 提供了一組很棒的 CSS3 Animation mixins ，讓我們可以直接套用。它其實就是從 Animation.css 移植過來的。

### AniJS

[AniJS](http://anijs.github.io/) 是一個宣告式的 CSS 動畫 library ，它讓我們可以在 HTML 元素中加入一個 `data-anijs` 屬性，並用敘述式來定義動作事件、動畫效果、以及要作用在哪個元素上。要特別注意的是，它也必須搭配 Animation.css 使用。

 <p data-height="268" data-theme-id="0" data-slug-hash="cEqhf" data-default-tab="result" class='codepen'><a href='http://codepen.io/jaceju/pen/cEqhf/'>範例： AniJS</a></p>