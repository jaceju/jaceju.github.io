---
layout: post
title: '解決下拉式選單覆蓋圖層的問題'
date: 2005-5-20
wordpress_id: 19
comments: true
tags: ["JavaScript"]
---

最近遇到的一個問題： IE 上能否解決 `div` 圖層被 `select` 下拉式選單遮住的問題？如下圖：

![](/resources/select_cover/select1.png)

我透過 Google 大神，找到了下面這篇文章，它解決了這個問題：

[Sample for using a DIV IFRAME shim to cover over SELECT Boxes and other windowed controls in IE.](http://dotnetjunkies.com/WebLog/jking/archive/2003/10/30/2975.aspx)

<!--more-->

在 IE 上， `select` 標籤屬於視窗化控制元件，因此會蓋在所有圖層的上方。解決的方式是用一個空的 `iframe` 標籤，在圖層出現前，先壓在 `select` 的上方，然後再將圖層疊上去。

註：在這篇文章之前有一篇「 How to cover an IE windowed control (Select Box, ActiveX Object, etc.) with a DHTML layer」，不過這篇文章因為被 Spam Attack ，所以會造成瀏覽器無法回應，只能用 Opera 開啟。

總結了裡面的討論，我參考原作者的 JavaScript ，改良出一個通用的 function 。裡面用到了一些特殊的功能，讓 IE 以外的瀏覽器不透過 `iframe` 的協助，因為它們並不會有類似的問題。

![](/resources/select_cover/select2.png)

```html
<!DOCTYPE html>
<html>
<head>
<style>
#container {
position: relative;
left: 50%;
margin-left: -300px;
width: 600px;
}
</style>
<script>
function showDiv(sDivID, bState) {
    var oDiv = document.getElementById(sDivID);
    /*@cc_on
    @if (@_jscript_version >= 5)
    try {
        var oIframe = document.getElementById('HelpFrame');
        oIframe.scrolling = 'no';
    } catch (e) {
        var oIframe = document.createElement('iframe');
        var oParent = oDiv.parentNode;
        oIframe.id = 'HelpFrame';
        oParent.appendChild(oIframe);
    }
    oIframe.frameborder = 0;
    oIframe.style.position = 'absolute';
    oIframe.style.top = 0;
    oIframe.style.left = 0;
    oIframe.style.display = 'none';
    @end @*/
    if (bState) {
        oDiv.style.display = 'block';
        /*@cc_on
        @if (@_jscript_version >= 5)
        oIframe.style.top = oDiv.style.top;
        oIframe.style.left = oDiv.style.left;
        oIframe.style.zIndex = oDiv.style.zIndex - 1;
        oIframe.style.width = parseInt(oDiv.offsetWidth);
        oIframe.style.height = parseInt(oDiv.offsetHeight);
        oIframe.style.display = 'block';
        @end @*/
    } else {
        /*@cc_on
        @if (@_jscript_version >= 5)
        oIframe.style.display = 'none';
        @end @*/
        oDiv.style.display = 'none';
    }
}
</script>
</head>
<body>
<div id="container">
<form>
<select>
<option>A Select Box is Born ....</option>
</select>
</form>
<br />
<br />
<a href="#" onclick="showDiv('PopupDiv', true); return false;">Click to show DIV.</a> <br />
<br />
<a href="#" onclick="showDiv('PopupDiv', false); return false;">Click to hide DIV.</a>
<div id="PopupDiv" style="position:absolute; top:10px; left:50px; height: 40px; padding:4px; display:none; background-color:#000000; color:#ffffff; z-index:100;"> .... and a DIV can cover it up<br />
through the help of an IFRAME. </div>
</div>
</body>
</html>
```

執行結果：

<iframe src="/resources/select_cover/frame.htm" width="80%" height="200"></iframe>

有興趣的朋友請自行研究，有使用上的問題也歡迎告知。

補述：如果在 Dreamweaver 已用內建的圖層隱藏功能的話，直接把 showDiv 函式加在後面即可。例如：

```html
onmouseover="MM_showHideLayers('Layer1','','show'); showDiv('Layer1', true);"
onmouseout="MM_showHideLayers('Layer1','','hide'); showDiv('Layer1', false);"
```