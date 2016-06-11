title: 用 Sub-Class 來測試被相依的程式碼
date: 2015-07-08 10:14:58
tags: ["TDD", "測試"]
---

同事問了我一個如何撰寫測試的問題，我覺得滿有趣的，整理起來分享給大家。

<!-- more -->

情境是這樣子的，他想為一個舊有的類別補上測試，但這個類別會相依一個外部套件；被相依的這個套件會對儲存媒介取兩次值來比對，再依照比對的結果進行不同的商業邏輯。

程式碼我稍做了簡化，大致上如下：

```php
class TargetClass
{
    private $dep;

    public function __construct()
    {
        $this->dep = new DepClass; // 外部相依類別
    }

    public function targetMethod($a, $b)
    {
        if ($this->dep->get('prev') === $this->dep->get('current')) {
            return $a + $b; // 待測試邏輯
        } else {
            return $a * $b; // 待測試邏輯
        }
    }
}
```

註：請不要太在意待測試邏輯做了什麼，這裡只是為了示範而已。

原本他是想用 Mockery 的方式來注入：

```php
$mock = Mockery::mock('DepClass');
$mock->shouldReceive('get')
    ->with('prev')
    ->andReturn(true);

$mock->shouldReceive('get')
    ->with('current')
    ->andReturn(false); // 跟上面衝突
```

但一個方法不可能同時 stub 兩次值，所以此路不通 (也不應該這樣做) 。

我們的測試：

```php
class TargetClassTest extends PHPUnit_Framework_TestCase
{

    public function testTargetMethodInTrulyCondition()
    {
        $target = new TargetClass;
        $expected = 5;

        $actual = $target->targetMethod(2, 3);

        $this->assertEquals($expected, $actual);
    }

    public function testTargetMethodInFalselyCondition()
    {
        $target = new TargetClass;
        $expected = 6;

        $actual = $target->targetMethod(2, 3);

        $this->assertEquals($expected, $actual);
    }
}
```

```
class TargetClassTest extends PHPUnit_Framework_TestCase
{
    protected function tearDown()
    {
        Mockery::close();
    }

    public function testTargetMethodInTrulyCondition()
    {

        $mock = Mockery::mock(DepClass::class);
        $target = new TargetClass($mock);
        $expected = 6;

        $mock->shouldReceive('get')
            ->with('prev')
            ->andReturn(true);

        $mock->shouldReceive('get')
            ->with('current')
            ->andReturn(false);

        $actual = $target->targetMethod(2, 3);

        $this->assertEquals($expected, $actual);
    }

    public function testTargetMethodInFalselyCondition()
    {
        $mock = Mockery::mock(DepClass::class);
        $target = new TargetClass($mock);
        $expected = 5;

        $mock->shouldReceive('get')
            ->with('prev')
            ->andReturn(true);

        $mock->shouldReceive('get')
            ->with('current')
            ->andReturn(true);

        $actual = $target->targetMethod(2, 3);

        $this->assertEquals($expected, $actual);
    }
}
```

## 改寫成可測試的程式碼

這招一開始我是從 91 哥那裡學到的，不過國外其實對它已經有給它一個名稱： Extract and Override Call 。

```php
class TargetClass
{
    private $dep;

    public function __construct()
    {
        $this->dep = new DepClass; // 外部相依類別
    }

    public function targetMethod($a, $b)
    {
        if ($this->condition()) {
            return $a + $b; // 待測試邏輯
        } else {
            return $a * $b; // 待測試邏輯
        }
    }

    protected function condition()
    {
        return $this->dep->get('prev') === $this->dep->get('current');
    }
}
```

```php
class TargetClassTest extends PHPUnit_Framework_TestCase
{

    public function testTargetMethodInTrulyCondition()
    {
        $target = new SubTargetClass1;
        $expected = 5;

        $actual = $target->targetMethod(2, 3);

        $this->assertEquals($expected, $actual);
    }

    public function testTargetMethodInFalselyCondition()
    {
        $target = new SubTargetClass2;
        $expected = 6;

        $actual = $target->targetMethod(2, 3);

        $this->assertEquals($expected, $actual);
    }
}

class SubTargetClass1 extends TargetClass
{
    protected function condition()
    {
        return true;
    }
}

class SubTargetClass2 extends TargetClass
{
    protected function condition()
    {
        return false;
    }
}
```
