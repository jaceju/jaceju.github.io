title: 關於 PHP Traversing 的這檔事
tags:
  - CSS
date: 2019-12-24 10:37:59

---

`foreach` 大概是 PHP 程式中最常見的語法結構之後，本文將會介紹 `foreach` 的一些觀念，以及幾個跟它相關的 PHP 7 特色。

<!--more-->

## foreach 起手式

### 常見的 foreach 用法

一般我們最常看到 [`foreach`](https://www.php.net/manual/en/control-structures.foreach.php) 用在遍歷 (traversing) 陣列裡的元素，例如：

```php
$arr = [1, 2, 3];

foreach ($arr as $num) {
    echo "$num\n";
}
```

而如果想遍歷關連式陣列 (associative array) ，同時取得元素的鍵 (key) 與值 (value) ，可以用以下語法：

```php
$arr = ['a' => 1, 'b' => 2, 'c' => 3];

foreach ($arr as $key => $num) {
    echo "$key => $num\n";
}
```

如果陣列元素本身也是陣列，我們稱為「巢狀陣列 (nested array) 」。在遍歷巢狀陣列時，我們可以用 `list(...)` 來解構每個陣列元素：

```php
$arr = [
    ['a', 1],
    ['b', 2],
    ['c', 3],
];

foreach ($arr as list($alpha, $num)) {
    echo "$alpha => $num\n";
}
```

在 PHP 7.1 之後，你可以用方括號來取代 `list()` ：

```php
foreach ($arr as [$alpha, $num]) {
    echo "$alpha => $num\n";
}
```

當然別忘了 PHP 7.1 之後， `list()` 可以用指定鍵的方式來取值：

```php
$users = [
    ['id' => 1, 'name' => 'Alice', 'age' => 18],
    ['id' => 2, 'name' => 'Bob', 'age' => 24],
    ['id' => 3, 'name' => 'Carl', 'age' => 33]
];

foreach ($users as ['name' => $name, 'age' => $age, 'id' => $id]) {
    var_dump("$id $name: $age");
}
```

### 如果沒有 foreach

PHP 有提供幾個函式用來操作陣列裡的指標，以及取得指標指向的陣列元素；分別是 [`reset`](https://www.php.net/manual/en/function.reset.php) / [`prev`](https://www.php.net/manual/en/function.prev.php) / [`next`](https://www.php.net/manual/en/function.next.php) / [`current`](https://www.php.net/manual/en/function.current.php) / [`end`](https://www.php.net/manual/en/function.end.php) 。

你可以用 [`while`](https://www.php.net/manual/en/control-structures.while.php) 搭配以上的函式來遍歷陣列：

```php
$arr = [null, 1, 2, false, null, 3, 4];

// 直接找到最後一個元素
// 這裡指標是指向最後一個元素
var_dump(end($arr));

// 因為指標已經跑到最後一個元素的位置
// 所以要重置指標
reset($arr);

// 遍歷陣列裡的元素
while (!is_null(key($arr))) {
    var_dump(current($arr));
    next($arr);
}

// 指標的位置已經沒有元素了
var_dump(current($arr));
```

另一個不用 `foreach` 的方法是使用 `array_walk` 這個函式：

```php
$arr = [1, 2, 3];

array_walk($arr, function ($item) {
    echo "$item ";
});

$arr = ['a' => 1, 'b' => 2, 'c' => 3];

array_walk($arr, function ($item, $key) {
    echo "$key => $item";
});
```

### 用 foreach 來列舉物件屬性

`foreach` 也可以用來列舉 (listing) 物件的屬性，只要該物件不是屬於可遍歷的物件。

當你對一個物件實體用 `foreach` 來列舉屬性的話，你只能看到它的公開屬性：

```php
class MyClass
{
    public $publicVar = 'public var';

    protected $protectedVar = 'protected var';

    private $privateVar = 'private var';
}

$class = new MyClass();

foreach ($class as $key => $value) {
    echo "$key => $value\n";
}
```

但是如果你是在物件內部對 `$this` 做列舉屬性，那麼你可以看到這個物件所有的屬性：

```php
class MyClass
{
    public $publicVar = 'public var';

    protected $protectedVar = 'protected var';

    private $privateVar = 'private var';

    public function iterateSelf()
    {
        foreach ($this as $key => $value) {
            print "$key => $value\n";
        }
    }
}

$class = new MyClass();

$class->iterateSelf();
```

注意，之所以特意用「列舉屬性」將「遍歷元素」的概念區分開來，實在是因為 `foreach` 對 PHP 物件的操作真的很微妙。

一般來說，我們希望用 `foreach` 來遍歷集合的元素，而不是列舉物件的屬性；所以當物件屬於一個集合時，就需要讓物件所屬的類別實作一些特別的介面。

## 用 foreach 來遍歷的介面

### Traversable

如果你需要的是一個可以被遍歷的物件 (通常是集合物件) ，那麼你可以檢查它是不是屬於 `Traversable` 這個介面。

```php
if ($obj instanceof Traversable) {
    // ...
}
```

但是要注意 `Traversable` 的幾個特點：

1. 類別不能直接實作 `Traversable` 介面。
2. 雖然陣列可以用 `foreach` 來遍歷，但它並不屬於 `Traversable` 介面。

```php
// 不能直接實作
class MyExample implements Traversable {} // Error

// 陣列不屬於 Traversable
$arr = [1, 2, 3];
var_dump($arr instanceof Traversable); // false
```

再次強調：物件雖然可以用 `foreach` 來操作，但它不一定是 `Traversable` 。

```php
// 物件可以 foreach 列舉屬性，但不一定是 Traversable
$obj = (object) ['a' => 1, 'b' => 2, 'c' => 3];
foreach ($obj as $key => $value) {
    echo "$key => $value\n";
}
var_dump($obj instanceof Traversable); // false

class MyExample {}
$obj = new MyExample();
var_dump($obj instanceof Traversable); // false
```

### Iterator 與 IteratorAggregate

由於不能直接實作 `Traversable` 介面，官方建議應該改為實作 `Iterator` 或是 `IteratorAggregate` 這類的介面，它們都繼承自 `Traversable` 介面。

`Iterator` 介面就如同前面介紹的 `next` 、 `current` 等函式一樣，提供了操作指標與取得指標所指向的元素等方法介面，以供類別來實作。

以下是一個很典型的範例：

```php
class IteratorExample implements Iterator
{
    private $position = 0;

    private $data = [];

    public function __construct(array $data)
    {
        $this->position = 0;
        $this->data = $data;
    }

    public function rewind()
    {
        $this->position = 0;
    }

    public function current()
    {
        return $this->data[$this->position];
    }

    public function key()
    {
        return $this->position;
    }

    public function next()
    {
        ++$this->position;
    }

    public function valid()
    {
        return array_key_exists(
            $this->position,
            $this->data
        );
    }
}
```

我們可以用 `while` 敘述來遍歷 `Iterator` 物件裡的元素：

```php
$it = new IteratorExample(['a', null, 'b', 'c']);

$it->rewind();

while ($it->valid()) {
    $key = $it->key();
    var_dump($it->current());
    $it->next();
}
```

當然也可以用 `foreach` 來遍歷，因為這時所生成的物件實體已經屬於 `Traversable` 介面了：

```php
foreach ($it as $value) {
    var_dump($value);
}

var_dump($it instanceof Traversable); // true
```

實作 `Iterator` 介面的好處，就是可以依照自定義的邏輯來遍歷物件內的元素，這在某些特別的情境下很好用。

另一個更為簡便的介面是 `IteratorAggregate` ，它只需要實作 `getIterator` 這個方法就可以了， `getIterator` 方法必須回傳一個實作 `Iterator` 的物件。

PHP 內建了[多種 Iterator 類別](https://www.php.net/manual/en/spl.iterators.php)讓開發者不需要從頭定義一個實作 `Iterator` 介面的類別，以下示範 `ArrayIterator` 這個類別如何跟 `IteratorAggregate` 介面搭配：

```php
class IteratorAggregateExample implements IteratorAggregate
{
    private $data = [];

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function getIterator()
    {
        return new ArrayIterator($this->data);
    }
}

$it = new IteratorAggregateExample(['a', 'b', 'c']);

foreach ($it as $value) {
    echo "$value\n";
}
```

用 `IteratorAggregate` 介面的好處是，你可以動態更換 `getIterator` 方法的回傳內容，而不必讓程式綁死在特定的 Iterator 類別上。

### iterable 型別

`Traversable` 雖然可以用來判斷變數可否被遍歷，但它卻不適用在陣列變數上。因此 PHP 在 7.1 加入了一個偽型別 (pseudo-type) ： [`iterable`](https://www.php.net/manual/en/language.types.iterable.php) ，可以用在 [Argument type declarations](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration) (即 type hint) 及 [Return type declarations](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration) 上。

```php
function getArr(): iterable
{
    return ['a' => 1, 'b' => 2, 'c' => 3];
}

function traverse(iterable $list)
{
    foreach ($list as $item) {
        echo "$item ";
    }
}

$arr = getArr();
$it = new ArrayIterator($arr);

var_dump(is_iterable($arr)); // true
var_dump(is_iterable($it));  // true

traverse($arr); // 1 2 3
traverse($it);  // 1 2 3
```

因此建議在程式中，可以用 `iterable` 型別來取代 `Traversable` 介面。

## 如何在 foreach 時節省記憶體

有時候要遍歷的對象，在生成後可能會佔用很大的記憶體空間，這可能會造成 PHP 執行時期的記憶體不足。以 `range` 為例：

```php
function showMemUsageIf(bool $show = false): void
{
    if ($show) {
        echo round(memory_get_usage() / 1024 / 1024, 2) . ' MB' . PHP_EOL;
    }
}

showMemUsageIf(true); // 15.42 MB
$a = range(1, 1000000);
foreach ($a as $num) { ... }
showMemUsageIf(true); // 47.43 MB
```

因此在 PHP 5.5 之後的版本，提供了 [Generator](https://www.php.net/manual/en/class.generator.php) 這個類別，它可以協助我們在必要時才生成要處理的元素。

但是你不能直接用 `new` 來生成一個 `Generator` 類別的物件實體，取而代之的是 PHP 提供了 `yield` 這個新語法。

`yield` 用途和 `return` 很類似，但 `yield` 只能放在函式或類別方法中，而包含了 `yield` 的函式或類別方法，其回傳值的型態都是 `Generator` 類別。

由於 `Generator` 類別實作了 `Iterator` 介面，所以可以用 `foreach` 來遍歷其物件實體。

先來看一個基本的 `yield` 用法：

```php
function gen()
{
    echo "a: ";
    yield 1;

    echo "b: ";
    yield 2;

    echo "c: ";
    yield 3;

    // 當然也可以放在迴圈裡
    foreach (['d' => 4, 'e' => 5] as $key => $num) {
        echo "$key: ";
        yield $num;
    }
}

foreach (gen() as $num) {
    echo "$num ";
}
```

可以看到當執行 `foreach` 的第一輪時， `gen()` 函式並不是一次跑完，而是會停在第一個 `yield` 上，並回傳 `yield` 後面的值。而第二輪則是從第一個 `yield` 後繼續執行，然後停在第二個 `yield` 。

由此可以看出，每當執行到 `yield` 時， `Generator` 就會保留目前的執行位置，並給出當下 `yield` 的結果，這在處理大量資料時就顯得非常有用了。

所以我們用 `Generator` 來重寫 `range` ，這個新函式我們命名為 `xrange` ：

```php
function xrange($start, $limit, $step = 1) {
    if ($start < $limit) {
        if ($step <= 0) {
            throw new LogicException('Step must be +ve');
        }

        for ($i = $start; $i <= $limit; $i += $step) {
            yield $i;
        }
    } else {
        if ($step >= 0) {
            throw new LogicException('Step must be -ve');
        }

        for ($i = $start; $i >= $limit; $i += $step) {
            yield $i;
        }
    }
}

showMemUsageIf(true); // 15.42 MB
$a = xrange(1, 1000000);
foreach ($a as $num) { ... }
showMemUsageIf(true); // 15.42 MB
```

可以看到改用 `Generator` 後，記憶體的用量幾乎沒有什麼改變。

再舉一個例子，例如我們想要處理一個超大的 log 文字檔：

```php
function readLog(string $file)
{
    $f = fopen($file, 'r');
    try {
        while ($line = fgets($f)) {
            yield $line;
        }
    } finally {
        fclose($f);
    }
}

foreach (readLog("access.log") as $line) {
    // echo $line;
}
```

透過這個方式，我們可以把每一行 log 的處理邏輯和讀檔邏輯分離開來，而且也不會佔用太多記憶體。

### Generator 的特異功能

`Generator` 有幾個特別 `yield` 的用法，這裡特別介紹一下。

`yield` 可以跟 `return` 一起使用，不過這時候必須用 `Generator::getReturn()` 來取得回傳值：

```php
function getValues(): iterable
{
    yield 'value';
    return 'returnValue';
}

$values = getValues(); // $values 是一個 Generator
foreach ($values as $value) {
    var_dump($value);
}
echo $values->getReturn(); // 'returnValue'
```

`yield` 可以回傳鍵 (key) 與值 (value) ：

```php
function getMembers(): iterable
{
    yield 'a' => 1;
    yield 'b' => 2;
    yield 'c' => 3;
}

foreach (getMembers() as $key => $value) {
    echo "$key: $value\n";
}
```

巢狀的 Generator 可以用 `yield from` 來達成， `yield from` 後面要跟著一個 `iterable` 的值：

```php
function one(): iterable
{
    yield 1;
}

function two_one(): iterable
{
    yield 2;
    yield from one();
}

function ten_to_seven(): iterable
{
    for ($i = 10; $i >= 7; $i--) {
        yield $i;
    }
}

function count_down(): iterable
{
    yield from ten_to_seven();
    yield from [6, 5];
    yield from new ArrayIterator([4, 3]);
    yield from two_one();
}

foreach (count_down() as $num) {
    echo "$num ";
}
```

當然 `yield` 也可以用來回傳匿名函式：

```php
function getFunctions()
{
    yield function ($num) {
        return $num;
    };

    yield function ($num) {
        return $num + 1;
    };

    yield function ($num) {
        return $num + 2;
    };
}

foreach (getFunctions() as $func) {
    var_dump($func(1));
}
```

但以下這個例子是錯誤的，因為 anonymous function 是一個 `Closure` 物件，不能接在 `yield from` 後面：

```php
function getFunctions()
{
    yield from function ($num) {
        for ($i = 1; $i <= $num; $i++) {
            yield $i;
        }
    };
}

foreach (getFunctions() as $func) {
    // ...
}

// PHP Fatal error:  Uncaught Error: Can use "yield from" only with arrays and Traversables
```

直接 `yield` 就可以了：

```php
function getFunctions()
{
    yield function ($num) {
        for ($i = 1; $i <= $num; $i++) {
            yield $i;
        }
    };

    yield function ($num) {
        for ($i = $num; $i >= 1; $i--) {
            yield $i;
        }
    };
}

foreach (getFunctions() as $func) {
    foreach ($func(10) as $result) {
        var_dump($result);
    }
}
```

## 在 PHPUnit 的 Data Providers 中使用 yield

在寫 PHPUnit 的測試案例時，我們通常會對某個單元的程式給出多組不同的測試資料，好驗證它的邏輯正確性；而這通常會透過 [Data Providers](https://phpunit.readthedocs.io/en/8.5/writing-tests-for-phpunit.html#data-providers) 這個機制來完成，例如以下這個加法測試：

```php
use PHPUnit\Framework\TestCase;

class DataTest extends TestCase
{
    /**
     * @dataProvider additionProvider
     *
     * @param int $a
     * @param int $b
     * @param int $expected
     */
    public function testAdd(int $a, int $b, int $expected)
    {
        $this->assertSame($expected, $a + $b);
    }

    public function additionProvider(): iterable
    {
        return [
            [0, 0, 0],
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 2],
        ];
    }
}
```

在上面的測試中， `additionProvider` 這個方法就是我們的 data-provider ，它必須回傳一個陣列 (這裡稱為 data set) 的陣列；而在測試案例 `testAdd` 這個方法上，我們要加入它的註解，並用 `@dataProvider` 來宣告我們的 data-provider 是 `additionProvider` 這個方法；而 `additionProvider` 的第二層陣列的項目 (即 data set 裡的每個元素) ，就會依序代入 `testAdd` 方法參數 `$a` 、 `$b` 、 `$expected` 裡。

不過很多剛用 data-provider 的朋友常會忘了要包第一層的陣列，導致測試錯誤；這裡我們可以改用 `yield` 來回傳每個 data set ，好避開這類的錯誤，同時也可以讓 data-provider 更加易讀 (雖然要多打幾個 `yield` 就是了) ：

```php
    public function additionProvider(): iterable
    {
        yield [0, 0, 0];
        yield [0, 1, 1];
        yield [1, 0, 1];
        yield [1, 1, 2];
    }
```

當然也可以用 `key => value` 的形式：

```php
    public function additionProvider(): iterable
    {
        yield 'Set 1' => [0, 0, 0];
        yield 'Set 2' => [0, 1, 1];
        yield 'Set 3' => [1, 0, 1];
        yield 'Set 4' => [1, 1, 2];
    }
```

## 參考

- [php 之 Generator 生成器及 yield](https://www.jianshu.com/p/86fefb0aacd9)
- [在 PHP 中使用 `yield` 來做內存優化](https://learnku.com/laravel/t/8704/using-yield-to-do-memory-optimization-in-php)
- [Yield in PHPUnit data providers](https://www.entropywins.wtf/blog/2017/10/09/yield-in-phpunit-data-providers/)