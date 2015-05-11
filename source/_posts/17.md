---
layout: post
title: 'CSS 排版觀念：Box Model'
date: 2005-5-9
wordpress_id: 17
comments: true
tags: ["CSS"]
---

CSS 排版有一個很重要的觀念： Box Model 。它描述了元素之間的彼鄰關係，同時也左右了我們是否能夠成功透過 CSS ，完成整個頁面的呈現。

<!--more-->

Box Model 的意思是說，每一個元素我們都可視它為一個 Box 。一個 Box 由以下屬性組成： `margin` 、 `padding` 、 `border` 、 `content` 。

註： `content` 非真的可用的 CSS 屬性，這裡只是為了方便說明。

而一個 Box 的實際寬度 (高度) 是由 `padding` + `border` + `width` (`height`) 所組成，如下圖 (取自 [MSDN](http://msdn.microsoft.com/library/default.asp?url=/library/en-us/dnie60/html/cssenhancements.asp))：

![IE Box Model](/resources/css_boxmodel/boxdim.gif)

所以一般我們指定的 `width` 和 `height` 是 content 的寬和高，而沒有包含 `border` 和 `padding` 。換句話說，一個元素真正佔用的視覺空間，應該是 content + `padding` + `border` ，這是標準的 CSS 規範。

 不過在 IE5/5.5 時代，一個元素的寬高則包含了 content + padding + border 。這個錯誤的實作，造成現今許多 CSS 排版上的困擾，但是也不是沒不是沒有辦法解決。 [Box Model Hack](http://tantek.com/CSS/Examples/boxmodelhack.html) 提供了解決之道，重點在於利用 IE5/5.5 對 CSS 解讀上的 Bug ，讓我們所希望之元素正確的寬高能正確地在 IE5/5.5 顯示出來。

對於 `absolute` 和 `fixed` 而言，錯誤的 Box Model 或許影響較小 (不過也絕對不是沒有影響，像是如果要正確控制圖層的寬度時)；但對 `relative` 和 `static` 來說，因為它們都還是會保留其所佔有的空間。因此如何正確地調整 content 的大小，就會影響到我們的排版。

以下我們來看看 Box Model 的各個組成分子。

請特別注意：我在以下圖示中，元素上色的部份，除了有特別說明外，都是包含 border + padding + content ，這點非常重要！因為除了 `body` 標籤外，元素的 `background` 屬性的作用都不會包含 `margin` 。

## border

`border` 是一個「加上去」的屬性，換句話說，一般都是用來區隔元素與元素用的。 `border` 的外圍即為元素的最外圍，因此計算元素實際的寬高時，就一定要將 `border` 納入。換句話說， `border` 會佔有空間，所以在計算精細的版面時，一定要將 `border` 的影響考慮進去。

如下圖，黑色虛線部份即為 `border` ：

![border](/resources/css_boxmodel/border1.png)

還有一點要特別注意，如果我們在元素上設定背景色時， IE 是作用在 padding + content ，而 Firefox 則是作用在 border + padding + content 上。

## padding

`padding` 會在元素內容的周圍加上我們所指定大小的空間；而如果我們沒有指定元素的寬高時，那麼該元素的內容就會受到 `padding` 所擠壓。如下圖：

![padding](/resources/css_boxmodel/padding1.png)

如果元素的內容中有行內顯示元素時，我們可以利用 padding 的設定來讓它們在我們想要的地方折行，而不用對 content 指定寬度；這樣的技巧我用在全版面的兩欄式版面上，使得我不用對難用的 `width` 屬性傷腦筋。

其實 `padding` 就這麼簡單，不過可別小看它，在 CSS 排版裡， `padding` 加上 `margin` 的設定，就能夠使版面千變萬化。

## margin

`margin` 的意義就是該元素與其他元素間的邊界距離，它的應用大概也算是 CSS 排版很重要的技術之一。所以我打算多花一點時間解釋它。

我們可以分以下兩種狀況解釋：「元素與相鄰元素的距離」及「元素與父元素間的距離」。

「元素與相鄰元素的距離」指得是元素間是緊鄰的 (不論是區塊顯示元素或行內顯示元素) ，而沒有階層關係。例如：

```html
<span id="i1">行內顯示元素1</span><span id="i2">行內顯示元素2</span>
```

這兩個 `span` 標籤就是緊鄰關係。而 `span` 標籤預設屬於行內顯示元素 (`display: inline`) ，因此它們的邊界距離就是 `i1` 的 `margin-right` 加上 `i2` 的 `margin-left` ，如下圖。

![行內 margin](/resources/css_boxmodel/margin1.png)

另一種緊鄰關係是區塊顯示元素，例如：

```html
<div id="b1">區塊顯示元素1</div><div id="b2">區塊顯示元素2</div>
```

`div` 標籤預設屬於區塊顯示元素，也就是在它的前後會加入換行的控制。要注意的是，區塊顯示元素它們的邊界距離是重疊的！而當 `b1` 的 `margin-bottom` 大於 `b2` 的 `margin-top` 時， `b1` 和 `b2` 實際的距離就以 `b1` 的 `margin-bottom` 為準，如下圖。

![區塊 margin](/resources/css_boxmodel/margin2.png)

還有一種緊鄰關係是浮動元素，基本上它會是個區塊顯示元素，但 `margin` 的呈現關係和行內顯示元素是很像的，這我會在介紹浮動元素時再加以說明。

「元素與父元素間的距離」就是指元素之間有階層關係時的邊界距離。例如：

```html
<div id="b3">
<div id="b4">內部區塊</div>
</div>
```

其中 b3 就是父元素， b4 則是子元素。 它們的邊界關係如下圖：

![父子元素 margin](/resources/css_boxmodel/margin3.png)

我們可以看到，子元素的邊界起始會以父元素的 Content 區為基準。

上面我們都是將 margin 設為正值，例如將元素的 `margin-top` 設為 `20px` ，那麼元素上面就會多出 `20px` 的空間。注意，我是說多出空間，而非向下移動！有什麼差別呢？

向下移動的定義是我們讓元素成為區塊顯示 (`display: block`) 或是它原本就是區塊顯示元素，然後指定它的 `position` 屬性為 `relative` ，最後設定它的 `top` 屬性為正值。

而多出空間則不論它的 `position` 屬性設定為何，硬是擠進我們指定的空間。而且設定 `margin` 之後，頁面內容超過螢幕顯示範圍，即時有捲軸也無法呈現完整的內容。

不過 IE6 和 FireFox 兩者對 Box Model 在 margin 的實作又有點不太一樣。 IE6 就算指定了父元素的 `height` 屬性，如果子元素的高度超過父元素的 `height` ，父元素就會被撐大，然後保留子元素 `margin-bottom` 的空間；而 FireFox 就不會。哪個實作是對的，我也不太清楚。

margin 也可以指定為負值，例如我在這篇「[如何正確實作出固定寬度且置中的版型？](/blog/archives/9)」裡，運用到了將 `margin-left` 設定為負值的技巧。這裡我再加以說明，將 `margin` 設定為負值是怎麼一回事。

在「元素與元素間緊鄰」時，我們將 `margin` 設定為負值，會使得 `margin` 設定為負值的元素「疊」到另一個元素上 (不過還是要視另一個元素所設定的邊界距離而定) 。例如，我們將 A 區塊的 `margin-bottom` 設為 0 ， B 區塊的 `margin-top` 設為 -10px ，那麼 B 區塊的文字就會疊到 A 區塊的文字上。

「元素間有階層性關係」時的關係，如果子元素的所指定的 margin 負值的絕對值大於父元素的 border + padding 時，就會使得子元素跑到父元素的外部去了。如圖，我們指定藍色元素的 `margin-left` 為 `-100px` ，那麼該元素就會往左跑 `100px` ；這時如果其父元素 (淺黃色) 的 `border-left` 和 `padding-left` 相加小於 `100px` ，我們就會看到該元素就會突出於父元素的左邊。

![negative margin](/resources/css_boxmodel/margin4.png)

總而言之，將 `margin` 指定為負值在 CSS 排版上有非常大的用處，如果能將它了然於胸，相信你在 CSS 排版的功力一定會大增的。

這篇我僅描述了 CSS Box Model 的一些基本觀念，雖然不是非常深入，但希望能夠讓大家對它們有基本的認知。而 CSS 排版除了 [Position](/blog/archives/15) 和 Box Model 外，還有一樣非常值得探討的技術，就是浮動 (float) ；我將會在下次的文章中談到它。

