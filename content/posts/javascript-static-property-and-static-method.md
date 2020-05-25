---
title: 'JavaScript 的靜態變數與靜態方法'
date: 2006-02-06 00:00:00 +08:00
tags: ["JavaScript"]
---

之前提到 JavaScript 撰寫物件時的寫法：

```js
var 物件類別名稱 = function([參數]) {
  this.屬性1 = null;
  this.屬性2 = new Array();
  this.方法1 = function([參數]) {
    // 方法1程式碼
    this.屬性1 = 'DEF';
}
this.方法2 = function([參數]) {
    // 方法2程式碼
    this.屬性2 = new Array(4, 5, 6);
  }
}

```

這種方法在有物件實體時才會有作用，如果要像 Java 或 PHP 一樣呼叫靜態方法的話，就要這樣寫：

<!-- more -->

```js
var 物件類別名稱 = function([參數]) {
}

// 一定要在建構函式之後再宣告，否則會有錯誤。
物件類別名稱.靜態變數 = null;
物件類別名稱.靜態方法 = function([參數]) {
  // 這時候不可使用 this 關鍵字
  物件類別名稱.靜態變數1 = 'DEF';
}

```

這樣我們可以利用它來建立一個 Singleton 類別  ：

```js
var MyTest = function() {
  this.msg = null;
  this.echo = function() {
    alert(this.msg);
  }
  this.setMsg = function(msg) {
  this.msg = msg;
  }
}
// 這裡是關鍵
MyTest._instance = null;
MyTest.getInstance = function() {
  if (!MyTest._instance) {
    MyTest._instance = new MyTest();
    this.msg = 'test!';
  }
  return MyTest._instance;
}

```

測試如下：

```html
<script src="test.js"></script>
<script>
<!--
var test1 = MyTest.getInstance();
test1.echo(); // show 'null'
test1.setMsg('this is test1!');
test1.echo(); // show 'this is test1!'
var test2 = MyTest.getInstance();
test2.echo(); // show 'this is test1!'
test2.setMsg('this is test2!');
test1.echo(); // show 'this is test2!'
//-->
</script>

```

可以看得出來， test1 和 test2 其實都是指向 MyTest._instance 。

當然用 JavaScript 實作 Singleton 的實際意義不大 (建構式還是公開的) ，這裡我只是在強調 JavaScript 靜態方法及變數的寫法而已。
