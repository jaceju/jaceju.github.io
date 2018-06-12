---
layout: post
title: "網站技術發展史"
date: 2012-11-21 09:26
comments: true
tags: ["Web 開發"]
---

## 前言

這篇主要是對 Web 技術的發展史做一個概略的介紹，讓大家對目前 Web 技術的演變能有初步的認知。

不過製作網站的技術很多，這裡我僅針對瀏覽器、 HTML 、 CSS 及 JavaScript 做粗略的演進說明，細節部份就請大家參考維基百科或其他更深入的資訊。

另外文章內容或多或少會帶有我個人的主觀意見，而我也儘可能透過網路上的資訊作查證，但一定會有錯誤及不足之處，還望大家能夠指正或補足。

<!--more-->

## 1991

HTML 最早是由網際網路 (World Wide Web) 之父 [Tim Berners-Lee](http://en.wikipedia.org/wiki/Tim_Berners-Lee) 所發明，而在 1991 年成為公開的文件規範。而該規範並不是 HTML 1.0 ，而是稱為 HTML Tags ；當時的 HTML 主要是用來表達資料，支援的標籤也不多。

## 1994

HTML 實際上成為規範是從 1994 年由 IETF 制定的 HTML 2.0 開始。這時候 MOSAIC 是市場上主要的瀏覽器。另外這時 CSS 概念被提出，雖然在這之前也已經有人提出樣式的構想，不過還是由 CSS 的層疊概念出線了。

## 1995

除了 MOSAIC ，1995 年有三個瀏覽器也問市了： Opera 、 Netscape 和微軟的 IE 。而 Netscape 為了能讓網頁可以跟使用者互動，因此找了 [Brendan Eich](http://en.wikipedia.org/wiki/Brendan_Eich) 設計一個腳本語言，當時稱為 LiveScript 。後來 Netscape 在與 Sun 合作之後，便將它改名為 JavaScript 。

JavaScript 最初是受到 Java 啟發而開始設計的，目的之一就是「看上去像 Java 」，但它實際上跟 Java 一點關係也沒有。而且早期的 JavaScript 並不是很完整的程式語言，只是用來給網頁開發者作一些動態選單、圖片特效的網頁小程式。

## 1996

由於 JavaScript 作為網頁的客戶端腳本語言非常成功，微軟推出了 IE 3.0 ，上面搭載了跟 JavaScript 相容的 JScript 。

而後 Netscape 將 JavaScript 提交給 ECMA (歐洲計算機製造商協會) 進行標準化，因而建立了 ECMA-262 標準，也就是 ECMAScript 。

在這之前由 W3C 召開了一次 CSS 討論會，由原提出者 [Håkon Wium Lie](http://en.wikipedia.org/wiki/H%C3%A5kon_Wium_Lie) 當做主要技術負責人，於是 CSS 1.0 規格出版；而 IE 3.0 也是第一個正式支援 CSS 的瀏覽器。

## 1997

隨著 Windows 95 的推出，微軟也將 Internet Explorer 4.0 整合進去，讓作業系統跟瀏覽器核心綁在一起，也造成日後的瀏覽器大戰。

這時 HTML 4.0 被列為推薦規範， ECMAScript 也推出正式的 1.0 版。

## 1998

CSS 2.0 在 1998 年正式推出，並且隨著 HTML 4.0 支配了網站設計這個領域。而這時 XML 也正式成為 W3C 推薦標準，為後來的 XHTML 開始鋪路。

有鑑於這時各家瀏覽器實作 HTML 及 CSS 有所差異，因此 Web 標準計劃 (The Web Standards Project) 創立了。目的是希望讓網頁在瀏覽器上的呈現能夠有一致性。只要照標準寫的網頁，可以在各家瀏覽器上呈現出一致的效果。

AJAX 的前身技術 XMLHTTP 也隨著微軟的 Outlook Web Access 出現。

## 1999

到了 1999 年， .COM 泡沫發展到了極致，也是瀏覽器大戰最火熱的時候， IE 5.0 與 Windows 98 第二版的結合開始瓜分了 Netscape 的市場。

這時 HTML 4.01 推薦版本也推出了，跟 HTML 3.2 及 HTML 4.0 相同，它們都是針對已經上市的規格所做的追溯版本。

接下來 W3C 不打算再維護 HTML ，而是把重心轉移到 XHTML 上。

## 2000

2000 年時，我們平安渡過千禧夜。這時以 IE 5.5 為展示平台的 DHTML 動態網頁技術被大量使用在網站上。

也在這一年 XHTML 1.0 推出了，它的語法要求很嚴格，如果瀏覧器用這個規範來看網頁的話，會使得現在很多網站會無法運作。

## 2001

接下來 .COM 泡沫一個接一個的破了，但 Microsoft.com 靠著 Windows 活了下來。

瀏覽器大戰也由 Windows 內建的 IE 6.0 獲勝，堪稱網站技術史最光明的時期，因為我們只需要專注一個瀏覽器。

XHTML 正式的規範到 1.1 ，不過限制也更為嚴格，連 mime-type 都必須是 application/xhtml+xml 。

也在這一年，由 JavaScript 大師 [Douglas Crockford](http://en.wikipedia.org/wiki/Douglas_Crockford) 提出了用 JSON 格式來表達資料內容。

## 2002

2002 年，這時候的 W3C 打算推出更嚴格的 XHTML 2.0 。

而且 Web 標準意識開始抬頭，很多網站技術的先驅開始推行符合 Web 標準的網站技術。

不過為了照顧高市佔率的 IE 5.5 及 IE 6.0 ，使得許多 CSS Hack 技術不斷地被研究出來。

## 2003

這時候 IE 6.0 已經獨霸市場，幾乎沒有對手可以相比。在贏得瀏覽器大戰的微軟，開始輕忽網站平台這個領域，他們把重心放在了 .NET ，他們認為這個是次世代的技術。

不過這時候其他瀏覽器廠商開始準備反攻了，他們的武器就是 Web 標準。其中與 Netscape 同時期誕生的 Opera 可以說是 Web 標準的推手。以 Webkit 為核心的 Safari 也正式推出 1.0 版。

## 2004

Mozilla 因為重新改寫 Netscape 並開放了原始碼，進而在 2004 年推出了 Firefox 1.0 。對於擁抱 Web 標準的開發者來說是個好消息，這使得 Firefox 的市佔率在一推出就出乎預料地高。

這一年 CSS 2.1 草案推出，主要是修正 CSS 2.0 的錯誤，並且去除掉一些瀏覽器沒有實作的功能。

這時 [Tim O'Reilly](http://en.wikipedia.org/wiki/Tim_O%27Reilly) 提出了我們所熟知的 Web 2.0 ；因為 Web 2.0 會用到大量的使用者互動，因此這時 JavaScript 又開始被重視了。

但這時候的 HTML 及 CSS 實作實在是太雜亂，又加上 W3C 打算用 XHTML 整治的手段太過激進，因此三家瀏覽器廠商 Apple 、 Mozilla 、 Opera 就跳出來成立了 WHATWG 這個組織。 WHATWG 的目的是把現有的 HTML 實作做一個完整的規範，並且與當代流行的技術做結合。不久，他們就推出了 Web Application 1.0 。

## 2005

由於 IE 樹大招風，許多木馬及蠕蟲都透過 IE 的漏洞入侵，因此許多瀏覽器用戶轉而投向了 Firefox 的懷抱。

AJAX 這個技術被 [Jesse James Garrett](http://en.wikipedia.org/wiki/Jesse_James_Garrett) 正式命名，隨後也被納入 Web 2.0 關鍵技術中，從此網站技術正式邁進 AJAX 時代。

## 2006

除了 IE 6.0 之外，其他瀏覽器因為起跑很久了，所以幾乎都可以在很小的工作量下就可以符合 Web 標準。但因為 IE 6.0 的核心一直都沒有進步，結果被網站開發者罵到臭頭。微軟也發現 Firefox 逐漸吃掉瀏覽器市場，所以推出了 IE 7.0 。但基本上 IE 7.0 也只是 IE 6.0 的功能加強版，跟 Web 標準落差還是很大。

至於 W3C 的 XHTML 2.0 根本沒有瀏覽器廠商願意實作，所以宣告失敗。

CSS 3 的部份規格已經被某些瀏覽器實作了，而 IE 仍然不直接支援，只能用自家的技術來模擬。

## 2007

因為 XHTML 2.0 的失敗， W3C 只好回頭接受 WHATWG 所制定的規格，並改稱為 HTML 5 。

HTML 5 時代正式來臨。這也告訴我們：只有被市場所接受的才是贏家。

## 2008

以搜尋引擎起家的 Google 也利用 Webkit 核心推出了 Chrome 瀏覽器。

這在當時造成了不少話題，很多網站開發者都非常期待 Google 能為網站技術帶來一些新氣象。

## 2009

許多報告都指出， Chrome 和 Firefox 開始分食 IE 的市場，直到這時微軟才驚覺網站平台的時代來臨了。這時微軟也針對 HTML 5 推出 IE 8.0 ，但支援程度依舊非常落後，不過因為 Windows 7 的關係，使得它還是佔有一席之地。

當然也不是只有 IE 在進步，其他瀏覽器也持續著他們自己的腳步；在 Web 標準上， Opera 一直是先驅，幾乎很多 HTML 5 的特性都是它先實作出來。 Firefox 則是將重心放在外掛套件上面，對 HTML 5 的支援採取保守的態度。而 Safari 也因為使用與 Chrome 相同核心的 Webkit ，所以正在迎頭趕上。

倒是 Chrome 瀏覽器因為其開發版本一直更新的關係，所以正式版本的版號推進速度非常快，讓其他瀏覽器廠商嚇了一大跳。

## 2011

針對 HTML5 時代的到來，微軟終於趕上了， IE 9.0 可以說是完全重新出發的作品。

> 瀏覽器大戰又再次開打了，不過戰場不再是在瀏覽器上，而是應用平台。像是 Chrome OS 、 Firefox OS 、 Windows 8 等等，各家廠商都想透過公開或私有的 HTML5 API 去存取裝置原生的功能，表面上看起來是共同推進 HTML5 規範，實際上卻是你來我往，暗潮洶湧。 (本段文字感謝 [Kuro](http://www.plurk.com/kurotanshi) 補充)

而 CSS 2.1 也終於定案了，但這只是 W3C 對它主導地位的一點掙扎。這時 CSS 3 早就已經被各大瀏覽器所支援。從這裡可以看出， W3C 的角色其實更像歷史的紀錄者，而非技術的制訂者。

## 2012

前陣子 WHATWG 的頭頭又出來說話，他們覺得 W3C 是要穩定的規格，而他們則是隨著時代而演進。因此 WHATWG 的 HTML 5 改名為 HTML Living Standard 。

所以接下來幾年可以說是 HTML 5 、 CSS 3 與 JavaScript 的天下了。

不過[新的 CSS 構想](https://speakerdeck.com/stopsatgreen/the-css-of-tomorrow-revised)已經悄悄地出現了， Web 開發技術也持續在演進中。

To be continued…

## 參考

- [Hypertext Markup Language](http://www.w3.org/MarkUp/draft-ietf-iiir-html-01.txt)
- [HTML (維基百科)](http://en.wikipedia.org/wiki/HTML)
- [CSS (維基百科)](http://en.wikipedia.org/wiki/CSS)
- [ECMAScript (維基百科)](http://en.wikipedia.org/wiki/ECMAScript)
- [JavaScript (維基百科)](http://en.wikipedia.org/wiki/JavaScript)
- [瀏覽器大戰 (維基百科)](http://zh.wikipedia.org/wiki/%E6%B5%8F%E8%A7%88%E5%99%A8%E5%A4%A7%E6%88%98)
- [網路演進](http://www.evolutionoftheweb.com/?hl=zh-tw)
- [W3C](http://www.w3.org/)
- [The Web Standards Project](http://www.webstandards.org/)
- [WHATWG](http://www.whatwg.org/)
