---
layout: post
title: '購物車程式架構簡介'
date: 2010-12-23
wordpress_id: 1438
comments: true
tags: ["PHP", "心得感想", "設計模式"]
---

自從學習開發 Web 程式以來，我的工作就離不開購物車了。從模仿其他網站的購物機制開始，到接觸了物件導向後的所寫的購物車架構，每一次的經驗都讓我成長不少。

不過每次所寫出來的購物車系統，不論是在新增功能或是修改上都讓我覺得非常麻煩；只要客戶有些稍微複雜一點的需求，常讓我改程式改到想翻桌。

後來接觸設計模式、 MVC 及 UnitTest 之後，一個新的購物車架構漸漸在我腦海裡成形。一來我不想再讓商品加入購物車、更改商品數量、促銷活動或是結帳等機制散落在各個 PHP 程式中，但我也不想讓它們完全集中在一個類別裡，那麼適當的架構分離就顯得非常重要。

於是乎，集合了多年的經驗，我在某個專案裡試做了一個新的購物車架構；而經過一段時間的線上測試後，事實證明它非常容易增加功能及修改功能，也更容易讓我們釐清整個購物流程。而且如果在良好的設計安排下，它也能做到模組化的功能抽換。我心中不由得吶喊：「就是它了！」

當然，這個機制並不是最好的，也可能無法因應所有網站的需求；但是這至少是我自己在電子商務技術這個領域的經驗，以及經過多次挫敗後所得到的成果。因此在以下的投影片裡，我將單純地就這個購物車機制來做一些探討，希望能為大家在架構的設計上，帶來一些不同的想法。

另外要提醒大家，這裡所提到的購物車架構，並沒有涉及所謂的後台商品上稿或是前台商品陳列等機制；換句話說，它不是一般我們所定義的購物車模組，請大家要先瞭解這一點。

<!--more-->
<div style="width:425px" id="__ss_6312192"><strong style="display:block;margin:12px 0 4px">[購物車程式架構簡介](http://www.slideshare.net/jaceju/ss-6312192)</strong><object id="__sse6312192" width="425" height="355">

<embed name="__sse6312192" src="http://static.slidesharecdn.com/swf/ssplayer2.swf?doc=random-101223013624-phpapp01&stripped_title=ss-6312192&userName=jaceju" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="425" height="355"></embed></object></div>
