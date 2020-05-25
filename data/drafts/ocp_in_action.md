# 以 Closure 達成 OCP

請教一個問題，鐵哥昨天有講到OCP：程式可以加外掛，但不可放到程式本身
實務方法可以用interface，外掛object，也可以用closure，外掛function
我想問的，外掛closure的方法，目前看到Laravel的mail::queue(), mail::send()都是用closure的方式
我想問的是，實務上我們該怎麼設計類似這種closure的方法
interface方式看得比較多比較有感，但對於像mail::send()這種closure設計方式，還沒抓到他的感覺
不知道有沒有什麼guide line或設計模式用closure這種方式
或是說怎樣的code，我們會想重構成這種closure的寫法

## Closure

你不想弄出一個介面，只是很單純地想直接做某件事的時候，就可以用 Closure 。

先舉 PHP 裡面常見的自訂排序函式 `usort` ：

```php
$a = [ 2, 5, 1, 6, 8, 4 ];
usort($a, function ($prev, $next) {
    return $prev > $next ? 1 : -1;
});

// $a => [ 1, 2, 4, 5, 6, 8, ]
```

PHP 會自動把後面那個 anonymous function 包裝成 Closure 物件。

