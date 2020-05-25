---
title: '[PHP] 神奇的 $this'
date: 2007-10-26 00:00:00 +08:00
tags: ["PHP"]
---

今天發現了一個 PHP 5.2.4 的奇怪現象，查了官方手冊也沒發現有人特別提起 (也可能是我沒找到) 。

<!-- more -->

學過 PHP 物件導向的人都知道， $this 這個關鍵字是在生成一個物件後才能使用的。例如：

```php
class Foo
{
    private $_foo = '_foo in class Foo.';
    public function test()
    {
        echo $this->_foo;
    }
}
$foo = new Foo();
$foo->test(); // _foo in class Foo.

```

而且 `$this` 在 Class 的程式碼裡代表的也是這個物件本身，在上例中即為 `$foo` 。

不過在 method 裡使用 `$this` 有個限制，那就是該 method 不能以 `static` 的方式來呼叫；也就是說，以下的執行方式是錯的：

```php
Foo::test(); // Fatal error: Using $this when not in object context in xxx.php
```

可是請看以下的程式碼：

```php
class Foo
{
    private $_foo = '_foo in class Foo.';

    public function test()
    {
        echo $this->_foo;
    }
}

class Bar
{
    public function test()
    {
        Foo::test();
    }
}

$b = new Bar();
$b->test(); // Notice: Undefined property:  Bar::$_foo in xxx.php
```

發現什麼問題了嗎？在 `Bar::test()` 裡我們竟然可以用 static 的方式呼叫 `Foo::test()` ！ 而且在 `Foo::test()` 裡的 `$this->_foo` 竟然變成了 `Bar` 類別的 `$_foo` 屬性！

至於這倒底是 PHP 的特色還是 Bug ？我也不知道，還望高手賜教。
