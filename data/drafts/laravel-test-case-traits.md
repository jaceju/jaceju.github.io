title: Laravel TestCase 的 traits 魔法
tags: 
  - Laravel
  - 測試

---

1. 如何避開 PHPUnit 的 `setUp` 與 `@before` 執行次序。
2. 如何取得類別繼承鍊所有用被 `use` 的 traits ？

開發 Laravel 的朋友如果常寫測試的話，應該很瞭解在 Test 類別裡可以使用 (`use`) 很多好用的 helper traits ，像是 `RefreshDatabase` 、 `WithoutMiddleware` 、 `WithFaker` 等；它們主要會幫開發者在每個測試案例執行之前，做一些環境或 fixture 的初始化。

在 PHPUnit 中，如果你要在測試案例執行之前做一些事情，通常會寫在 `setUp` 裡；不過如果有用到了 trait ，就不能在 trait 裡寫 `setUp` ，否則會被目前類別的 `setUp` 給蓋掉。這時候可以在 trait 方法的 docblock 區加入一個 `@before` 的 annotation ，這也會讓 PHPUnit 在測試案例執行前先執行這個方法。

不過如果你打開 `RefreshDatabase` 這個 trait 的原始碼，你會發現其中每個公開方法的 docblock 都沒有加上 `@before` ，當然其他 trait 也一樣。那為什麼 `RefreshDatabase` 能在測試案例執行前發生作用呢？到底施了什麼魔法？

先來看看為什麼 Laravel 不用 `@before` ？其實早期的版本 Laravel 也是用 `@before` 來處理這方面的機制，只是後來 PHPUnit 更新版本後讓它壞掉了。也就是以下 issue ：

https://github.com/sebastianbergmann/phpunit/issues/1616

原來 PHPUnit 早期的版本是先執行標記為 `@before` 的方法然後再執行 `setUp` ，但是在某個版本後，這個執行順序被對調；這麼一來，許多依賴原先執行順序的測試案例就全部壞掉了。為了避免測試案例相依在這種不確定的行為上， Laravel 決定一勞永逸地避開它。

Laravel 採取的做法就是找出這個測試案例類別用了哪些 helper traits ，然後再一一呼叫這些 helper trait 裡定義的方法。在 `Illuminate\Foundation\Testing\TestCase` 的 `setUp` 可以看到這個做法：

```php
    /**
     * Setup the test environment.
     *
     * @return void
     */
    protected function setUp()
    {
        if (! $this->app) {
            $this->refreshApplication();
        }

        $this->setUpTraits();

        // ...
    }
```


該如何取得類別繼承鍊所有用到的 helper traits 呢？來看看 `setUpTraits` 這個方法：

```php

    /**
     * Boot the testing helper traits.
     *
     * @return array
     */
    protected function setUpTraits()
    {
        $uses = array_flip(class_uses_recursive(static::class));

        if (isset($uses[RefreshDatabase::class])) {
            $this->refreshDatabase();
        }

        // ...
    }
```

其中這行就是關鍵：

```php
$uses = array_flip(class_uses_recursive(static::class));
```


也因為 `setUpTratis` 回傳了所有的 helper tratis ，所以你也可以在 `Tests/TestCase` 這個類別裡加入自訂的 helper traits ，例如：

```php
abstract class TestCase extends BaseTestCase
{
    // ...

    protected function setUpTraits()
    {
        $uses = parent::setUpTraits();

        if (isset($uses[MyCustomHelper::class])) {
            $this->setUpMyCustomHelper();
        }
    }
```    