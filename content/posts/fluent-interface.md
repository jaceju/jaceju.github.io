---
title: '很有趣的 Fluent Interface'
date: 2006-03-07 00:00:00 +08:00
tags: ["PHP"]
---

在研究 [Zend Framework Preview](http://framework.zend.com/) 的文件時，發現了一個很有趣的 PHP 寫法：

```
$select->from('round_table', '*')
       ->where('noble_title = ?', 'Sir')
       ->order('first_name')
       ->limit(10, 20);

```

看出來沒？除了 from 函式以外，每一個函式都直接接續著上一個函式。怎麼辦到的呢？

<!-- more -->

我一開始以為這是 PHP 的特異功能，所以我先試了以下程式：

```php
<?php
class TestA
{
    public function a() {}
    public function b() {}
    public function c() {}
}
$a = new TestA();
$a->a()
  ->b()
  ->c();

```

結果是不行的，然後我想了一下，如果把物件自己的參考 ($this) 丟出來不就行了？

```php
<?php
class TestA
{
    public function a() { return $this; }
    public function b() { return $this; }
    public function c() { return $this; }
}
$a = new TestA;
$a->a()
  ->b()
  ->c();

```

果然成功了，再回頭去看 Zend Framework 的做法，的確也是這樣寫，真是一種有趣的寫法。

不過這種方式我想應該只適用於原本就不傳回值的函式，那種要傳回其他資訊或物件的函式就沒法這樣玩了。

註：這個方法應該只有 PHP 5 才能用，PHP 4 好像不能直接用函式來當做物件參考；有錯的話請指正我。

補充： ASP (VBScript) 和 JavaScript 也可以這樣寫喔。

 ASP (VBScript) 版：

```
<%
Class TestA
    Public Function A()
        Response.Write "A"
        Set A = Me
    End Function
    Public Function B()
        Response.Write "B"
        Set B = Me
    End Function
    Public Function C()
        Response.Write "C"
        Set C = Me
    End Function
End Class
Dim oA : Set oA = New TestA
oA.A().B().C()
%>

```

這裡是 JavaScript 的動態版：

```js
var TestA = function () {
    this.a = function () {
        alert('Aa');
        return this;
    }
    this.b = function () {
        alert('Ab');
        return this;
    }
    this.c = function () {
        alert('Ac');
        return this;
    }
}
a = new TestA();
a.a().b().c();

```

然後這是 JavaScript 的靜態版：

```js
var TestB = function () {}
TestB.a = function () {
    alert('Ba');
    return this;
}
TestB.b = function () {
    alert('Bb');
    return this;
}
TestB.c = function () {
    alert('Bc');
    alert(this.d)
    return this;
}
TestB.d = 'abc';
TestB.a().b().c();
// b = new TestB();
// b.a().b().c(); // 這是不能執行的，不能透過物件取用靜態方法。
```

其實 JavaScript 裡也已經有類似的用法，例如：

```js
var s1 = 'ABC';
var s2 = 'DEF';
alert(s1.concat(s2).toLowerCase());
```

註：原來這些都已經是別的物件導向語言常用的寫法，可見我還有很多要學的呢。
