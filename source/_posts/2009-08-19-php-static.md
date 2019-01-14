---
layout: post
title: '[PHP] 瞭解 static 關鍵字'
date: 2009-8-19
wordpress_id: 670
comments: true
tags: ["PHP"]
---

先前同事詢問有關 PHP static 關鍵字的用法，這裡我簡單整理一下。

static 主要用途在於定義一個變數空間，讓函式或類別可以保留住該變數的值，直到下次的存取。

以下就各別來探討 static 在函式與類別中的用法。

<!--more-->

## 函式裡的 static 關鍵字

先來看看以下的例子：

```php
function getCount()
{
    static $count = 0;
    $count ++;
    return $count;
}

for ($i = 0; $i < 10; $i ++) {
   echo getCount(), "\n";
}
/* output:
1
2
3
4
5
6
7
8
9
10
*/
```

首先我們在 `getCount()` 這個方法中定義了一個 static 變數 `$count` ，然後每次呼叫 `getCount()` 時，就會對 $count 作累加的動作。

接著我們透過迴圈執行十次 `getCount()` 方法，便可得到了 1 ~ 10 的輸出結果。

這是因為將變數宣告為 static 後，第一次呼叫 `getCount()` 這個方法時，會為 `$count` 保留一塊記憶體空間；而當脫離了 `getCount()` 的變數作用域後，這個記憶體空間並不會被消滅掉，而會在下一次呼叫 `getCount()` 方法時，再次被配置進來，並還原先前的變數值。

因此，除了第一次呼叫 getCount() 方法外，接下來的每次呼叫都會讓 `$count` 值累加，而得到 1 ~ 10 的輸出結果；如果把 `static` 關鍵字拿掉，就會輸出十次的 1 。

## 應用在遞迴上的 static 關鍵字

瞭解函式中的 static 關鍵字用法後，我們來看一個應用的例子：

```php
function fibV1($n)
{
    if ($n <= 2) {
        return 1;
    } else {
        return fibV1($n - 2) + fibV1($n - 1);
    }
}
```

這是 PHP 版的 Fibonacci Sequence 遞迴函式，原理我就不多說明了。先來看看它在參數為 20 時所需要的執行時間：

```php
$start_time = (float) microtime(true);
echo fibV1(20), "\n";
$end_time = (float) microtime(true);
echo "Spent Time: ", ($end_time - $start_time), "(s)\n";
/* output:
6765
Spent Time: 0.26100397109985(s)
*/
```

這裡代入的數字越大，執行時間會越長。

現在我們用 static 關鍵字來改寫：

```php
function fibV2($n)
{
    static $result = array();
    if (!isset($result[$n])) {
        if ($n <= 2) {
            $result[$n] = 1;
        } else {
            $result[$n] = fibV2($n - 2) + fibV2($n - 1);
        }
    }
    return $result[$n];
}
```

然後再來看執行的時間：

```php
$start_time = (float) microtime(true);
echo fibV2(20), "\n";
$end_time = (float) microtime(true);
echo "Spent Time: ", ($end_time - $start_time), "(s)\n";
/* output:
6765
Spent Time: 0.0009009838104248(s)
*/
```

速度竟然差了快三百倍！為什麼？

其實是因為這裡的 static 關鍵字扮演了 cache 的角色 () ，讓程式不用重新計算已經算好的結果。而使用了 static 關鍵字後，也使得執行時間不會再隨著代入數字變大而變長。

註：不是任何遞迴函式都可以用 static 變數來做 cache ，在使用上要特別注意這一點。

## 類別裡的 static 關鍵字

在類別裡的 `static` 關鍵字，也扮演了類似的角色。我們利用 `static` 在類別裡定義的屬性，會佔用類別的記憶體空間。而透過同一類別所生成的物件，會彼此共享這個 static 屬性；所以不論我們產生多少同類別的物件，它們都會存取到同一個 static 類別屬性。

來看看以下的例子：

```php
class DB
{
    private static $_instance = null;

    private static $_instanceCount = 0;

    private function __construct()
    {
        self::$_instanceCount ++;
    }

    public static function getInstance()
    {
        if (null === self::$_instance) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function getInstanceCount()
    {
        return self::$_instanceCount;
    }
}
$db1 = DB::getInstance();
echo $db1->getInstanceCount(), "\n"; // 1
$db2 = DB::getInstance();
echo $db2->getInstanceCount(), "\n"; // 1
```

範例即為經典的 Singleton 模式，原理這裡先不多做說明。

這裡我們定義了兩個類別 static 屬性，分別是 `$_instance` 及 `$_instanceCount` ；而透過 `static` 定義的類別屬性，在類別裡存取時要用 `self` 關鍵字加上雙冒號 (`::`) ，例如 `self::$_instance` 。

接著我們可以看到在 `getInstance()` 方法中，如果 `self::$_instance` 是 null 的話，表示是第一次呼叫，那麼程式就會透過私有的建構式產生一個 DB 物件指定給 `self::$_instance` 變數，最後再將它回傳出去。這時雖然 getInstance() 裡的變數作用域已經結束，但 `self::$_instance` 卻會保留下來。

下一次 `getInstance()` 呼叫時，因為 `self::$_instance` 已經不再是 `null` 值，所以就會直接將其內容回傳給呼叫的程式了。

也因為這個原因，所以整個程式執行下來， DB 的 `__construct()` 方法也只被執行過一次，使得 `self::$_instanceCount` 也只累加一次，其結果永遠為 1 。

## 結論

一般 PHP 開發者很少會去使用 `static` 關鍵字，因為平常會用到 `static` 的場合其實也不多。這裡我再做一次 `static` 使用時機的重點整理：

* 需要記住上一次函式執行的結果。
* 某些可以保留執行結果的遞迴函式。
* 不希望因為物件個體不同，進而被影響的類別屬性。
* 類別的 Singleton 模式。

希望透過上面的說明，能讓大家對 static 關鍵字有進一步的瞭解。