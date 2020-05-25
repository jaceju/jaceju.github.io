## 如何設計一個需要 Closure 的方法

## 先前的問題

> OCP ：程式可以加外掛，但不可放到程式本身。實務方法可以用 interface 外掛 object，也可以用 closure 外掛 function 。外掛 closure 的方法，目前看到 Laravel 的 `mail::queue()` , `mail::send()` 都是用 closure 的方式。

> 我想問的是，實務上我們該怎麼設計類似這種 closure 的方法？ interface 方式看得比較多比較有感，但對於像 `mail::send()` 這種 closure 設計方式，還沒抓到他的感覺。不知道有沒有什麼 guideline 或設計模式用 closure 這種方式？或是說怎樣的 code ，我們會想重構成這種 closure 的寫法？

## 我的回答

最常用 closure 的時機，就是我們只是很單純地需要一個動作；而這個動作不需要被 reuse ，只需要寫一次就好。但為了這個動作去定義出一個 interface 或 class 太過麻煩，所以就可以採用 closure 。

事實上 closure 可以應用在很多設計模式的實作裡，例如 `usrot` 函式，它是這樣寫的：

```php

$a = array(3, 2, 5, 6, 1);

usort($a, function ($a, $b)
{
    if ($a == $b) {
        return 0;
    }
    return ($a < $b) ? -1 : 1;
});
```

你可以去更改 `usort` 函式的第二個參數，傳入不同的排序規則。如果你知道 Template Method Pattern 的話，那麼它就是 hook 了排序演算法其中一個步驟。

當然不是只有 Template Method Pattern 可以用，還有像是 Chain of Responsibility 模式。這裡我弄個示意用的簡單例子：

```php
class CorExample
{
    private $closures = [];

    public static function createChain(Closure $closure)
    {
        $chain = new static;
        $chain->next($closure);
        return $chain;
    }

    public function next(Closure $closure)
    {
        $this->closures[] = $closure;
        return $this;
    }

    public function process(array $data)
    {
        foreach ($this->closures as $closure)
        {
            if (!$closure($data)) {
                continue;
            }
            return;
        }
    }
}
```

然後我們可以這樣用：

```php
$chain = CorExample::createChain(function ($data) {
        if (20 === array_sum($data)) {
            echo "The sum of data is 20\n";
            return true;
        }
        return false;
    })->next(function ($data) {
        if (in_array(5, $data)) {
            echo "This data contains 5\n";
            return true;
        }
        return false;
    })->next(function ($data) {
        if (4 === count($data)) {
            echo "There are 4 elements in data\n";
            return true;
        }
        return false;
    });

$chain->process([1, 2, 3, 4]);
```

由此可見其實 closure 的彈性很大，多數狀況用它非常方便。

那麼 closure 的缺點是什麼？

那就是它在沒辦法很清楚地表示出它可以做什麼事，要看程式碼才知道。這麼一來，所有的細節會曝露在主要的程式碼中。當然你可以把 closure 放在命名合適的變數中來輔助閱讀，但通常很少會這麼做。而 interface 就可以明明白白地去定義要傳入的行為物件能做什麼事，對主要程式碼來說就會很容易閱讀。

至於 closure 的 context 會不會是個問題？其實一般來說 closure 要 bind 的 context 對象通常就在附近，所以造成 context 混亂的問題其實不常發生；如果發現會有 context 的誤解，那就表示你的設計太複雜了。

總結一下， closure 很靈活，適合不需要 reuse 的情境。如果需要清楚表達要用來擴充的物件能做什麼事，還是用 interface 比較好。