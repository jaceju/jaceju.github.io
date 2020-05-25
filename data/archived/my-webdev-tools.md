---
layout: post
title: "我的 Web 開發工具"
date: 2012-01-23 16:42
comments: true
tags: 連結分享
---
在我從事 Web 開發這段期間，其實一直依賴著很多好用的工具及參考文件；當然也不是所有的工具和文件我都精通，但它們確實幫我節省了很多開發的時間，也讓我學到很多有趣的技術。

以下我就來分享一些我收集並放在手邊參考的資訊，我也會大略地描述它們的內容與用途。

<!--more-->

## Javascript

### Formatter

* [Online javascript beautifier](http://jsbeautifier.org/)

  用來格式化雜亂無章的 JavaScript 程式碼，通常我都用來偷看別人壓縮過的 JavaScript 是怎麼寫的。

* [Online JavaScript Packer](http://jscompress.com/)

  跟上面那個剛好相反，用來打包 JavaScript 程式碼。當然目前還有很多更好的選擇，能直接整合在開發流程裡，但線上版的總是比較方便。

### Library / CDN

* [cdn js - the missing cdn](http://www.cdnjs.com/)

  這個網站幫我們很多常見的 JavaScript Library 放在 CDN 服務上。如果 Google Libraries API 找不到的話，可以來這裡找找看。

* [Microjs](http://microjs.com/)

  這個網站收集了很多較不常見的 JavaScript Library ，並且分門別類讓我們可以清楚的瞭解它們的用途。通常我用到的機會不大，但有用到時，就會發現有很多寶可以挖。

* [URI.js - URLs in Javascript](http://medialize.github.com/URI.js/)

  用來解析網址的好工具，我目前是用它來製作 Portable 的 Backbone.js 程式。

### JSON

* [Online JSON Viewer](http://jsonviewer.stack.hu/) / [Json Parser Online](http://json.parser.online.fr/)

  這兩個工具可以用樹狀的方式來呈現 JSON 輸出；除了可以用來驗證 JSON 外，我通常也用來看 JSON 的結構是不是正確的。

### Converter

* [Js2coffee](http://js2coffee.org/)

  這個工具可以幫我們把 JavaScript 轉成 CoffeeScript ；有趣的是，它也是 CoffeeScript 寫的。一開始學習 CoffeeScript 時，用到的機會比較多。

### Syntax

* [JavaScript Garden](http://bonsaiden.github.com/JavaScript-Garden/)

  這是收集了一些 JavaScript 常見問題的網站，通常我在遇到某些語法問題時，會來看看。

### Online Tester

* [jsFiddle](http://jsfiddle.net/)

  線上測試 JavaScript 的好用服務，而且也提供一些主流 JavaScript Library 的預載。

* [Tinkerbin](http://tinkerbin.com/)

  跟 jsFiddle 一樣的服務，但它直接支援 CoffeeScript/SASS/LESS 等語法。

* [JS Bin](http://jsbin.com/#javascript,html)

  這個服務也可以線上測試 JavaScript ，也支援多數主流 JavaScript Library 。

### jQuery

* [jQuery API](http://api.jquery.com/)

  開發 jQuery 必備參考手冊。

* [Lazy Load Plugin for jQuery](http://www.appelsiini.net/projects/lazyload)

  延遲載圖的 jQuery Plugin ，目前我是用在圖多的網站上。

* [jQuery Form Plugin](http://jquery.malsup.com/form/)

  讓表單支援 Ajax 的好工具，也能使用 Ajax 來處理檔案上傳；它一直是我最愛的 jQuery Plugin 之一。

* [DataTables (table plug-in for jQuery)](http://www.datatables.net/)

  很漂亮且功能強大的 Table Plugin ，而且支援 jQuery UI 的 Theme 。

* [Pines Notify](http://pinesframework.org/pnotify/)

  類似 Mac 上的 Growl ，讓網站可以在網頁右上方顯示通知。

### Backbone.js

* [Backbone.js](http://documentcloud.github.com/backbone/)

  Backbone.js 的官方網站，同時也是參考手冊；目前是我最常瀏覽的網站。

* [Underscore.js](http://documentcloud.github.com/underscore/)

  除了是 Backbone.js 必要的 library 外，它裡面提供的很多功能對 JavaScript 開發也非常有用。

* [Backbone.js Tutorials](http://backbonetutorials.com/)

  收集了一些 Backbone.js 的教學文件。

* [Tutorials, blog posts and example sites](https://github.com/documentcloud/backbone/wiki/Tutorials%2C-blog-posts-and-example-sites)

  Backbone.js 官方列出的教學與範例原始碼，我有時會來這裡看高手是怎麼用 Backbone.js 。

* [Backbone patterns](http://ricostacruz.com/backbone-patterns/)

  使用 Backbone.js 可以應用的一些 Patterns ，有很多好用的密技。

* [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate)

  一個結合了後端 Node.js 程式，很完整的 Backbons.js App 範本。

## CSS

### SASS Tools

* [SASS](http://sass-lang.com/)

  提供可程式化的 CSS 語法，也是我目前在 Web 開發上的利器。

* [Compass](http://compass-style.org/)

  目前是我製作前端網站必備工具之一，它在 SASS 語法上加入更多方便的外掛，讓我可以很輕鬆地處理很多原本很複雜的 CSS 。

* [css2sass](http://css2sass.heroku.com/)

  這個工具可以把 CSS 轉換成 SASS ，當我需要把某些別人寫好的 CSS 片段放到目前的 SASS 檔案中時，我就會用這個工具來協助我轉換。

### Layout

* [CSS Layout Generator](http://csscreator.com/version2/pagelayout.php)

  視覺化的 CSS Layout 產生工具，雖然很久沒用了，但依舊推薦給剛學 CSS Layout 的朋友。

* [CSS layouts](http://www.maxdesign.com.au/articles/css-layouts/)

  這是一個收集 CSS Layout 教學的網站，我之前會在這裡找接近專案需要的版型，再舉一反三地套用到專案上。

### Formatter

* [ProCSSor - Advanced CSS Prettifier](http://procssor.com/process)

  用來重新格式化 CSS 的工具，也有選項可以設定。

* [CSS整形與最佳化工具](http://cdburnerxp.se/cssparse/css_optimiser.php?lang=zh)

  利用 CSSTidy 來重整 CSS 程式碼，也提供格式化輸出。

* [CSS Lint](http://csslint.net/)

  這個工具可以用來找出 CSS 寫法上的問題，讓 CSS 可以更加精鍊。

* [Remove unused CSS](http://unused-css.com/)

  可以找出網站沒用到的的 CSS ，並整理出乾淨的 CSS 讓我們下載。

### Browser Support

* [CSS - Contents and compatibility](http://www.quirksmode.org/css/contents.html)

  這個網頁整理了目前主流瀏覽器對 CSS 2.1 / CSS 3 各種屬性的支援程度。

### Snippets

* [Incredibly Useful CSS Snippets](http://webexpedition18.com/articles/useful-css-snippets/)

  這是很久以前找到的好用 CSS 程式片段，但後來用了 Compass 後就比較少參考了。

* [CSS Word-wrap](http://www.broculos.net/en/article/css-word-wrap)

  很有用的程式碼片段，它將目前各家瀏覽器支援的 white-space 屬性做了整理。

### Framework

* [Formee](http://www.formee.org/)

  表單美化的 CSS Framework ，但目前用到的機會也是很少。

* [Bootstrap, from Twitter](http://twitter.github.com/bootstrap/)

  目前最常用的 CSS Framework 。

* [Twitter Bootstrap Generator](http://www.martinbean.co.uk/bootstrap-generator/)

  如果沒有安裝 LESS 時，這個工具可以用來調整 Twitter-Bootstrap CSS 的參數。如果有裝 LESS 的話，直接改其中的 scaffolding.less 會比較快。

* [Skeleton](http://getskeleton.com/)

  目的跟 Twitter-Bootstrap 很像，也是一個很完整的 CSS Framework 。不過 Skeleton 多了 Media Query 的特色，更適合用在行動裝置上。

### CSS3 Generator

* [CSS3.0 Maker](http://css3maker.com/)

  這個線上工具大概是我看過最完整的 CSS3 特效產生器了。

* [Layer Styles](http://layerstyles.org/)

  這個 CSS 產生器的介面很類似 Photoshop 的屬性視窗來協助我們調整 Box 的相關屬性。利用它也可以作出很多不錯的按鈕樣式。

* [CSS3 Generator](http://www.css3generator.com/)

  這個 CSS3 產生器也是非常完整，它的特色是會用問答的方式幫我們產生出想要的 CSS3 樣式。

* [CSS3 Playground](http://css3.mikeplate.com/)

  也是支援多種 CSS3 特效的產生器。

* [CSS3 Generator](http://www.css3.me/)

  這個工具的功能就少了一點，但介面很好看。

* [Ultimate CSS Gradient Generator](http://www.colorzilla.com/gradient-editor/)

  專業級的 CSS3 漸層產生器，能設定的選項鉅細靡遺。

* [Linear Gradients](http://westciv.com/tools/gradients/)

  也是用來產生 CSS3 漸層特效的工具，但後來也加入了一些其他 CSS3 效果。

* [CSS3 Gradient Generator](http://gradients.glrzad.com/)

  也是很不錯的 CSS3 漸層產生器，但選項稍微少了點。

### Button Maker

* [CSS3 Button Generator](http://css3button.net/)

  很專業的 CSS3 按鈕樣式產生器。

* [Button Maker](http://css-tricks.com/examples/ButtonMaker/)

  也是按鈕產生器，但介面上就沒有上面那個專業。

### References

* [CSS3.com](http://www.css3.com/)

  這個網站就是有關 CSS 的問答網站，也提供了基本的 CSS 參考手冊。

* [Media Queries](http://mediaqueri.es/)

  這個網站收集了很多使用 Media Query 的網站，主要我是用來參考高手們如何在不同尺寸下呈現網站。

## HTML5

### Detection

* [Modernizr](http://www.modernizr.com/)

  這個 Library 可以用來偵測瀏覽器對 HTML5 / CSS3 的支援程度，讓開發者可以選擇替代方案。

### Template

* [HTML5 Boilerplate](http://html5boilerplate.com/)

  提供預先設定好的 HTML5 範本，，讓我們不必從無到有建置 HTML5 網站。

* [Initializr](http://www.initializr.com/)

  基於上面的 HTML5 Boilerplate 的 HTML5 範本，但提供了更多樣化的選項，讓我們可以自訂要加在範本上的元件；它也是目前我製作新網站一定會用到的工具之一。

* [SwitchToHTML5](http://switchtohtml5.com/)

  這個工具可以產生一個簡單的 HTML5 範本，不過目前我很少用了。

### Features List

* [Element Index](http://html5doctor.com/element-index/)

  這個網站把所有 HTML5 支援的 HTML 標籤都列出來；是我剛開始學習 HTML5 時，會來查詢標籤定義的地方。

* [HTML5 Demos and Examples](http://html5demos.com/)

  這個網站展示了很多 HTML5 的新特色；先前 HTML5 剛流行起來時，我會在這裡看看有什麼新玩意兒。

* [The HTML5 test](http://html5test.com/)

  測試瀏覽器對 HTML5 的支援程度，一般是在新瀏覽器版本推出時，我會用這個服務來測試。

* [Mobile HTML5](http://mobilehtml5.org/)

  這個網站列出目前行動裝置對 HTML5 的支援，這是之前在製作 [PHPConf.TW](http://phpconf.tw) 網站時會參考到的。

* [CSS3 & HTML5 Browser Support](http://www.findmebyip.com/litmus/)

  列出目前主流瀏覽器對 HTML5 及 CSS3 的支援狀況。

### Framework

* [LimeJS HTML5 Game Framework](http://www.limejs.com/)

  可以用來製作 HTML5 遊戲，目前還沒機會用到。

* [Baker Ebook Framework 2.0](http://bakerframework.com/)

  製作 HTML5 電子書的框架，目前也還沒有機會用到。

### Tools

* [Manifested](http://manifested.dregsoft.com/)

  可以幫網站建立離線檔案清單，目前還沒有機會在實戰中使用。

### Reference

* [HTML5 web dev reading list](http://www.popstardefense.com/blog/js-development-reading-list)

  這是一份學習 HTML5 的推薦閱讀清單；有時間的話可以全部看看，我目前是挑有興趣的先看。

### Cheat Sheet

* [HTML5 Canvas Cheat Sheet](http://blog.nihilogic.dk/2009/02/html5-canvas-cheat-sheet.html)

  把 HTML5 Canvas 的特色精簡成一份小抄，可以在邊開發時邊參考。

* [HTML5 Security Cheatsheet](http://html5sec.org/)

  這個網站把 HTML5 安全方面的問題整理起來，並提供簡單的解決方案。

## DOM Tools

* [XRAY](http://westciv.com/xray/)

  這是很久以前我就一直放在手邊用的 bookmarklet 小工具，可以列出 HTML 元素的一些概況。重要的是它支援各家主流瀏覽器，讓我在沒有 Firebug 時也可以使用。

* [MRI](http://westciv.com/mri/)

  用來測試輸入的 Selector 是不是能找到我們想要的那些元素，尤其在寫 jQuery 時非常方便。

## Browser Tools

* [resizeMyBrowser](http://resizemybrowser.com/)

  這個工具提供了很多常見的行動裝置可視區域大小，點選後可以快速把瀏覽器重設為我們選擇的大小。通常我是用來測試網站能不能在某些行動裝置上看。

* [Detect Mobile Browsers](http://detectmobilebrowsers.com/)

  提供了偵測是否為行動裝置瀏覽器的各種做法，這也是我在做行動網站時會用到的好工具。

## PHP

### Database Client

* [phpMyAdmin](http://www.phpmyadmin.net/home_page/index.php)

  這應該不用多介紹了，幾乎我手邊的機器都會安裝的 MySQL 線上 Client 工具。

### Formatter

* [PHP Formatter](http://beta.phpformatter.com/)

  用來格式化 PHP 程式碼的好工具，這是我在寫作時會用到的。

### Snippet

* [PHP Modify HTTP Headers (Examples)](http://www.jonasjohn.de/snippets/php/headers.htm)

  這個也是我常參考的程式片段，不然我每次都記不住 header 的內容該怎麼下。

## Design

### Templates

* [Free Web Templates](http://zoomzum.com/15-best-sites-to-download-free-web-templates/)

  每次有需要做頁面時，我都會在這些網站裡找靈感。

### Color

* [kuler](http://kuler.adobe.com/)

  Adobe 推出的色彩配置工具，雖然我很少用。

* [Color Scheme Designer 3](http://colorschemedesigner.com/)

  也是非常強大的色彩配置工具。

### Icons

* [Loading CSS spinners and bars generator for AJAX & JQuery](http://cssload.net/)

  AJAX 載入圖示的產生器。

* [Faviconist](http://faviconist.com/)

  用單一字元來製作網站的 favicon 。

* [favicon.ico Generator](http://www.favicon.cc/)

  視覺化的 favicon 製作工具，可預覽它在瀏覽器上呈現的樣子。

* [23 Glyph, Symbols & Simple Icon Sets](http://favbulous.com/post/774/23-glyph-symbolssimple-icon-sets)

  這篇文章收集一堆很簡鍊的單色圖示集，也是我在製作網站後台而需要圖示時，會來找尋的地方。

### Mockup

* [20 Free Wireframe and Mockup Applications](http://designmodo.com/free-wireframe-mockup/)

  這篇文章收集了二十種免費 Mockup 工具，不過我並沒有全部都試過；目前我還是以自己手繪為主。

## Regular Expression

* [RegExr](http://www.gskinner.com/RegExr/)

  測試 Regular Expression 的工具，應該適用於大多數有支援 Regular Expression 的語言。

* [Online Javascript Regular Expression Tester](http://www.pagecolumn.com/tool/regtest.htm)

  專為 Javascript Regular Expression 所寫的線上測試工具。

* [Rubular](http://rubular.com/)

  專為 Ruby Regular Expression 所寫的線上測試工具。

## Documents

* [Docpool.co](http://docpool.co/)

  收集了一些網站前置作業文件的範本。

## Projects

* [Redmine](http://www.redmine.org/)

  最近終於開始有時間研究的一套強大專案管理工具，支援多種版本控制系統。

## Site Tools

* [Test your RewriteRules for Apache mod_rewrite](http://martinmelin.se/rewrite-rule-tester/)

  測試 Apache mod_rewrite Rewrite Rules 的服務，不過較複雜的規則可能在判斷上會有問題。

* [BuiltWith](http://builtwith.com/)

  從 Header 判斷網站是用什麼技術製作的。

* [Loads.in](http://loads.in/)

  可以從世界各角落測試網頁載入的時間。

## Code

### Snippets Share

* [Chop](http://chopapp.com/)

  用來分享一段小程式的服務。

### Online Diff

* [DiffNow - Compare files online](http://www.diffnow.com/)

  線上比對檔案差異，也可以把比對結果分享出來。


## Git

### Books

* [Git Community Book](http://book.git-scm.com/)

  這是由 Git 社群所共同完成的一本 Git 入門書籍。

* [Getting Started with Git](http://refcardz.dzone.com/refcardz/getting-started-git)

  免費的 Git 入門書。

### References

* [Git Reference](http://gitref.org/)

  很有用的 Git 指令參考文件。

* [Everyday GIT With 20 Commands Or So](http://schacon.github.com/git/everyday.html)

  這個也是很棒的 Git 指令參考文件。

* [Git for beginners: The definitive practical guide](http://stackoverflow.com/questions/315911/git-for-beginners-the-definitive-practical-guide)

  將在 stackoverflow 網站上一些很棒的實戰心得收集起來的文章。如果想要找更多實戰心得的話，可以直接連到： [Git Questions](http://stackoverflow.com/questions/tagged/git?sort=votes) 。

* [git - the simple guide](http://rogerdudler.github.com/git-guide/)

  簡單明瞭的 Git 入門。

### Tips

* [Automatically Deploying Website From Remote Git Repository](http://caiustheory.com/automatically-deploying-website-from-remote-git-repository)

  利用 post-receive hook 來自動化佈署網站。

* [如何切換 Git Repo](https://plus.google.com/108375073252780151818/posts/8yTDEfYUHDJ)

## Markdown Editor

* [Online Markdown Editor](http://www.ctrlshift.net/project/markdowneditor/)

  在左方輸入 Markdown 語法，就可以在右方即時預覽的 Markdown 編輯器。

* [Markdown Editor](http://joncom.be/experiments/markdown-editor/edit/)

  跟上面一樣，但提供了數種版面配置選項，也可以讓我們上傳 Markdown 文件編輯。

## Desktop App

* [NetBeans IDE](http://netbeans.org/)

  這個是目前我最得力的 PHP 開發助手。除了 PHP Class/Function 的自動完成與基本重構功能外，還加上了 PHPUnit/ZF/PHPDoc 等外部指令的支援。

* [Sublime Text 2](http://www.sublimetext.com/)

  號稱可以取代 Textmate 的強大文字編輯器，因為它啟動速度快，又支援 SASS/CoffeeScript 語法，目前是我在 NetBeans 之外的另一個好助手。

* [LiveReload](http://livereload.com/)

  這個 Mac 上的好用工具，可以幫我們監控專案中指定檔案類型的更新；通常是用在 CSS/SASS 及 JavaScript/CoffeeScript 這些檔案上。搭配瀏覽器的外掛程式後，就可以即時預覽這些檔案更動後的變化。

* [VirtualHostX](http://clickontyler.com/virtualhostx/)

  用來管理 Mac 上 Apache VirtualHost 的小工具，這也是我在開發 PHP 專案的利器之一。 (如果是 Rails 開發者的話， [Pow](http://www.webmonkey.com/2011/04/pow-simplify-ruby-on-rails-for-os-x/) 會是比較好的選擇。)

* [Sequel Pro](http://www.sequelpro.com/)

  免費的圖形化介面 Mac MySQL Client ，是在本機操作中，我用來取代 [phpMyAdmin](http://www.phpmyadmin.net/home_page/index.php) 的工具。

* [SourceTree](http://www.sourcetreeapp.com/)

  除了用 Terminal 直接操作指令外，它是我在 Mac 上使用 Git 必備的 Client 工具。

* [SmartSVN](http://www.syntevo.com/smartsvn/index.html)

  因為公司的版本控制系統是 Subversion ，因此這個 Mac Subversion Client 工具也是我目前最常使用的。

更多好用的 Desktop 工具，可以參考龍哥 (高見龍) 的這篇文章：[我的工具箱](http://blog.eddie.com.tw/2012/01/04/my-toolbox/)。

## 結論

這裡所羅列的資訊其實只是茫茫網海的冰山一角而已，我想一定還有更多更好用的工具與文件等待我們去發掘。

希望這篇文章能夠幫助大家在 Web 開發這條路上走得更順暢一些，也歡迎大家能夠分享自己常用的工具。


