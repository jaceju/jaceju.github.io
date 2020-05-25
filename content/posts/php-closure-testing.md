---
title: '在 PHPUnit 中測試需要 closure 的函式'
date: 2015-11-09T19:11:39+08:00
tags:
  - PHP
  - 測試
---

不知道你有沒有在開發 PHP 程式的過程中，測試過需要使用 anonymous function 或 closure 的函式或類別方法？我在開發自己的函式庫時，就遇到了需要測試 closure 是否被正確調用的問題。

在解決幾個問題後，我發現其實做法並不難，所以接下來我就來介紹幾個測試 closure 的方式。

<!-- more -->

## 範例

先來看看一個簡單的 closure 使用範例：

```php
class Example
{
    public function runClosure(Closure $closure)
    {
        $closure();
    }
}
```

在 `Example::runClosure` 方法中接受了一個 `$closure` 參數，而它的型別屬於 `Closure` 類別，使我們可以直接在程式裡用 `$closure()` 的方式來執行它的內容。


測試則是這樣寫的：

```php
class ExampleTest extends PHPUnit_Framework_TestCase
{
    public function testRunClosure()
    {
        $example = new Example();

        $closure = function () {};
        $example->runClosure($closure);
    }
}
```

在測試中，我們傳入一個 anonymous function 給目標物件的 `runClosure` 方法使用。在 PHP 中， closure 和 anonymous function 其實是一樣的，它們最後都會轉化成 `Closure` 物件；這點和 JavaScript 不同，要特別注意。

問題來了，我們怎麼驗證 `$closure` 被呼叫了呢？

## 遇到的問題

我第一個想法是使用 [Mockery](http://docs.mockery.io) 來將 anonymous function 包起來，看看 PHP 底層會呼叫 closure 的哪個函式，我再做 `shouldReceive` 驗證：

```php
$closure = Mockery::mock(function () {});
$example->runClosure($closure);
```

結果執行測試時，出現了以下錯誤訊息：

```
Argument 1 passed to Example::runClosure() must be an instance of Closure, instance of Mockery_0_Closure_Closure given
```

這就奇怪了， Mockery 所 mock 出來的物件，類型應該是 Closure 的子類別呀？為什麼會被 type hint 打槍呢？

帶著疑惑，我試著直接 mock `Closure` 類別：

```php
$closure = Mockery::mock(Closure::class);
$example->runClosure($closure);
```

錯誤訊息變成了：

```
Mockery\Exception: The class \Closure is marked final and its methods cannot be replaced. Classes marked final can be passed in to \Mockery::mock() as instantiated objects to create a partial mock, but only if the mock is not subject to type hinting checks.
```

原來問題就出在於 `Closure` 類別在 PHP 中是被宣告為 `final` ，也就是無法再被繼承。而 Mockery 遇到這樣的類別，[官方的建議](http://docs.mockery.io/en/latest/reference/final_methods_classes.html)是：

> The simplest solution is not to mark classes or methods as final!

就是不要用 `final` 啦！可是 Closure 是 PHP 的內建類別，沒辦法把 `final` 拿掉，這樣一來不就無解了？

## 注入 spy 物件來驗證

其實轉個念頭，因為傳入待測程式的 closure 內容是我可以控制的，所以我不一定要去 mock closure ，而是讓它實際跑跑看，然後驗證裡面的程式碼是否有被執行就可以了。而最簡單的方法，就是插入一個 spy 物件，透過它來得知 closure 是否有被執行。

我在測試案例裡 mock 了 `stdClass` 這個標準類別，然後放在 `$spy` 這個變數裡；然後告訴它應該要接收到 `detected` 這個方法被執行一次的資訊。最後把這個 `$spy` 變數注入 closure 裡，在裡面執行 `detected` 方法：

```php
    public function testRunClosure()
    {
        $spy = Mockery::mock(stdClass::class);
        $example = new Example();

        $spy->shouldReceive('detected')->once();

        $example->runClosure(function () use ($spy) {
            $spy->detected();
        });
    }
```

這樣一來就可以透過 Spy 物件來驗證 closure 是否有被執行了。

## 驗證注入目標物件的 closure

不過有時候我們會希望在 closure 裡使用目標物件，例如：

```php
class Example
{
    public function runClosure(Closure $closure)
    {
        $closure($this);
    }
}
```

這時 closure 就可以將目標物件當做參數注入，然後再執行它的方法。例如：

```php
$example = new Example();

$example->runClosure(function ($target) {
   $target->otherMethod();
});
```

但我只是要確認目標物件有被正確傳入 closure 中，所以應該要驗證目標物件的類別是 `Example` 就可以了。我們可以直接在 closure 中使用 `$this` 來呼叫驗證方法，因為這時的 `$this` 是指向測試案例的物件。所以測試就可以寫成：

```php
public function testRunClosure()
{
    $example = new Example();

    $example->runClosure(function ($target) {
        $this->assertInstanceOf(Example::class, $target);
    });
}
```

像這樣的場合就不需要使用 spy 物件了。

## 驗證使用 bindTo 的 closure

如果在待測目標物件的方法裡，使用 `Closure::bindTo` 這個方法來重新定義 `$this` 時，該怎麼測試呢？例如：

```php
public function runClosure(Closure $closure)
{
    $cb = $closure->bindTo($this);
    $cb();
}
```

注意，這時候 `$cb` 並不是用注入的參數，而是使用執行時期的 context (也就是 `$this` ) 來指向目標物件；這也使得我們不能在測試中直接用 `$this` 來呼叫驗證方法，必須另尋出路。

所幸 PHP 的 closure 還提供了一個 `use` 的語法，讓我們可以把外部變數帶入 closure 中。但它不能直接帶入 `$this` ，所以必須換個名字。最後測試就可以改成：

```php
public function testRunClosure()
{
    $assert = $this;
    $example = new Example();

    $example->runClosure(function () use ($assert) {
        $assert->assertInstanceOf(Example::class, $this);
    });
}
```

## 總結

closure 是在 PHP 5.3 中就引入的特性，現在越來越多函式庫與框架都已經將它納入設計時的考量了。當你有需要自己設計使用 closure 的方法時，就可以嘗試這些方法來測試 closure ：

1. 使用 anonymous function 時，使用 spy 物件來觀察。
2. 當 closure 會注入目標物件時，直接驗證目標物件的類別。
3. 當 closure 是透過 `bindTo` 來繫結目標物件時，用 `use` 來另外傳遞測試案例物件，以便呼叫 assertion 方法驗證。

如果有更好的方法，也歡迎大家建議。
