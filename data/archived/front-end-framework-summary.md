title: 幾個有興趣的前端框架
date: 2015-07-08 10:04:54
tags: ["開發工具", "前端開發"]
---

如果你像我一樣是一個對 UI 開發不那麼在行，或是無法花太多時間在 UI 設計的 Web 開發者，但卻想能夠快速建立一個可用的 UI 介面，那麼最快的方法就是借重別人寫好的前端框架。

這裡我對前端框架的定義是包含了頁面排版、風格樣式、 UI 元件等，不限純 CSS ，可以包含 JavaScript 。

本文從以前我所使用及目前研究的幾個前端框架，依照研究的深入程度，由深至淺來簡單分享我個人的一些分析心得。至於優缺點，完全是個人主觀意見，大家參考看看即可。

<!-- more -->

## [Twitter Bootstrap](http://getbootstrap.com/)

Twitter 所推出的 Bootstrap 大概是使用者最多，資源也最豐富的框架了。因為推出時間較早， Bootstrap 的社群也相當龐大；不少開發者也在它的基礎上建立了很多自訂的元件，延續了它在前端的戰場生命。

一開始 Boostrap 是以 [LESS](http://lesscss.org/) 開發的，不過後來官方也提供了 [SASS](http://sass-lang.com/) 版本；對我來說，在開發流程裡就不會再有 LESS 和 SASS 混搭的問題了。

### 優點

Boostrap 包含的樣式與元件都已經涵蓋了多數應用場合，而且文件非常完整。有許多第三方 UI 元件都是基於它來開發的。另外也有很多開發者在 Boostrap 的基礎上建立出多種 Theme 讓開發者套用，讓 Bootstrap 能跟上目前時下流行的網站設計風格。

在 Boostrap 的 LESS 與 SASS 版本中，都提供了大量的變數讓使用者可以做出自己的 Boostrap 客製化版本；而 Boostrap 也提供了[線上客製功能](http://getbootstrap.com/customize/)，讓官方網站直接幫你組合出適合你的 Boostrap 。

### 缺點

就我個人的使用經驗來看，稍微複雜的 Grid 系統常常需要多層巢狀 HTML 標籤來組合，大概就是 Bootstrap 的罩門了。另外表單的排版也是不夠簡明，一個小 UI 可能需要好幾層 HTML 來組合。

相依在 jQuery 上或許是另一個小缺點，兩者的 JavaScript 檔案大小相加後超過 100KB ，在行動裝置上使用時要特別注意載入的效率。

### 相關資源

* [Bootsnipp](http://bootsnipp.com/) - 讓使用者分享他們的 Bootstrap 元件或頁面範例。
* [Bootswatch](https://bootswatch.com/) - 提供多種 Theme 讓使用者套用。
* [Built with Bootstrap](http://builtwithbootstrap.com/) - 收集許多用 Boostrap 製作的網站。
* [Pingendo](http://pingendo.com/) - 使用 Bootstrap 來做 prototype 的 Mac App 。
* [GitHub 上的相關專案](https://github.com/search?utf8=%E2%9C%93&q=bootstrap)

## [Semantic UI](http://semantic-ui.com/)

一套強調語意化的前端框架，主要是在 HTML 標籤的 class 屬性去組合語意。例如兩欄等高的排版會長這樣：

```html
    <main class="ui two column equal height page grid">
        <div class="stretched divided row">
            <section class="twelve wide column"> ... </section>
            <aside class="four wide column"> ... </aside>
        </div>
    </main>
```

從 class 就可以看到跟 Boostrap 非常不一樣的設計理念，像 `column` 在不同的位置會有不一樣的解釋。第一層的 `two column ... page grid` 指這個 grid 裡會包含兩欄，而後的 `twelve wide column` 與 `four wide column` 則定義了欄的寬度。

另外 Semantic UI 2.0 有個特別之處，就是它在 Layout 和 UI 元件上，全部採用了 CSS Flexbox 設計。當然這樣會有瀏覽器支援的問題，但如果不必考慮這個問題的話，這樣的設計實在是讓我覺得很舒服。

目前 Semantic UI 是採用 LESS 開發，還沒有官方的 SASS 版本。

### 優點

Semantic UI 透過 class 的語意化組合使得頁面的 HTML 變得很簡潔，讓開發者不會像 Bootstrap 一樣迷失在 HTML 標籤海裡。另外搭配 HTML5 本身的語意化標籤，讓開發者可以更輕鬆地定位到他想套用程式的位置。

另一個優點是它的 UI 預設風格非常精緻，個人還滿喜歡的。當然它也跟 Boostrap 一樣可以更換 Theme ，而且在設計上是採用三層繼承架構。

### 缺點

雖然說語意化排版是 Semantic UI 的強項，但卻讓人有不知道該怎麼組合的挫敗感；網路上有關 Semantic UI 的 Layout 範例都停留在舊版，著實讓我在用 2.0 版時頭痛了一陣子。所幸最近官方的文件正逐漸改進中，應該能解決掉這個問題。

另外社群針對 Semantic UI 所寫的第三方 UI 元件實在不多，內建的元件也不如 Boostrap 多樣化；如果你不打算自己開發 UI 元件的話，這相當於限制你只能在這個框架中尋找替代做法。

Semantic UI 在 Responsive 的部份也必須因為有不同的排版策略而有不同的 HTML 區塊，這點反而不如 Boostrap 的設計 (但搭配 [RESS](http://www.lukew.com/ff/entry.asp?1392) 後反而變成優點了) 。

### 相關資源

* [Learn Semantic](http://learnsemantic.com/)

## [UIKit](http://getuikit.com)

UIKit 是 [YOOTheme](http://yootheme.com/) 開發的一套前端框架，除了 class 名稱不太一樣之外，整體設計理念很接近 Boostrap 3 ；尤其是 Responsive Grid 的設計，跟 Boostrap 如出一轍。

UIKit 的所有元件都做了 Responsive 化，同時把所有資訊都寫在 HTML 標籤上，所以它的元件不需要像 Boostrap 一樣寫額外的 JavaScript ；只要在元件 HTML 標籤上定義相關屬性，接下來的事情會由 UIKit 的 JavaScript 程式庫處理掉。不過它和 Boostrap 一樣，也需要 jQuery 的支援。

目前 UIKit 是採用 LESS 開發，還沒有官方的 SASS 版本。

### 優點

UIKit 的官方文件相當齊全，完全不輸 Bootstrap ；部份常用的 Web 元件甚至是 Bootstrap 所沒有提供的，像是 Date Picker 與 HTML Editor ，讓開發者不需要引用太多第三方套件。

除了傳統 Grid 排版， UIKit 也提供了 Flex 排版機制；讓開發者在不需考慮瀏覽器支援度的狀況下，可以更靈活地安排版面。

### 缺點

也因為 UIKit 跟 Boostrap 很像，所以在排版上也有多層巢狀 HTML 標籤的問題，不過與 Bootstrap 相比，已經改善不少。

另外也許是因為 UIKit 非大公司出品，在社群上的討論度不那麼高，使得它在第三方的支援上就不如 Boostrap 這麼廣泛。不過我想 UIKit 本身所提供的這些元件，就應該足以應付常見的需求了。

### 相關資源

* [UIKit 中文網](http://www.getuikit.net/)

## [Materialize](http://materializecss.com)

Materialize 是一群 Carnegie Mellon University 的學生，依照 Google 的 Material Design 所開發出來的框架。從它的 Grid 範例來看，應該也參考不少 Bootstrap 的設計。

目前 Materialize 是採用 SASS 開發，還沒有官方的 LESS 版本。

### 優點

Materialize 是目前實作較完整的 Material Design 框架，大多數 Material Design 的模式都很容易在這個框架中實現。而除了 class 名稱不同外，大多數的元件在使用上和 Bootstrap 是差不多的。它的文件非常清楚簡潔，大多數元件只要看範例就知道如何使用了。

如果你非常想在新專案實現 Material Design ，那麼這個框架絕對是首選。而如果你熟悉的是 Bootstrap ，但又想套用 Material Design 的話，可以參考看看 [Bootstrap Material Design](http://fezvrasta.github.io/bootstrap-material-design/bootstrap-elements.html) 。

### 缺點

因為 Materialize 發展還不到一年，所以社群支援程度還不夠高，相關應用發展也是不如 Bootstrap ；不過我想這個問題會因為 Material Design 被高度關注的狀況下，逐漸得到解決。

### 相關資源

* [5 Material Design Examples using MaterializeCSS](http://blog.codeply.com/2015/04/09/5-material-design-examples-using-materializecss/)
* [Material Design Blog](http://materialdesignblog.com/)

## [Material Design Lite](http://www.getmdl.io/)

Material Design Lite 是 Google 自己推出的 Material Design 框架，它的出現造成了社群中高度的討論。我個人是認為 Google 推出 Material Design Lite 其實帶有宣示的意味，它要讓開發者知道 Google 對 Material Design 真正想表達的就實現在這裡了 (當然這是我自己猜想的，沒有什麼根據) 。

目前 Material Design Lite 是採用 SASS 開發，還沒有官方的 LESS 版本。

### 優點

Material Design Lite 是 Google 推出的，未來發展性也許不錯 (雖然有可能夭折) 。

### 缺點

因為 Material Design Lite 的 class 是採用 BEM ，所以就有了 class 爆炸的問題，一個元件的定義可能就會包含了十來個 class 。

另外因為剛推出不久，它的元件也不夠豐富，文件的流暢性也不像其他框架這麼好。總之這個框架還需要時間熟成，有興趣的朋友不妨耐心等候。

## 結論

好的前端框架如果用在正確的地方，絕對可以節省很多開發時間。當然如果你的設計不是那麼中規中矩時，套用這些框架反而容易綁手綁腳，比不用還糟糕。
