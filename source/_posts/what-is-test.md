title: 這樣寫測試錯了嗎？
date: 2015-10-14 14:01:34
tags: ["測試", "PHP"]
---

這篇文章的出現，主要是因為尤川豪的 [PHP與撰寫測試入門](http://blog.turn.tw/?p=2741) 一文，然後在 Facebook 上也有相關討論：[連結一](https://www.facebook.com/groups/199493136812961/permalink/871965886232346/)、[連結二](https://www.facebook.com/groups/199493136812961/permalink/872137862881815/)。

只是當我提出測試不該有邏輯時，討論就往該不該有 assertion library 偏過去了。我發現我太執著在這個點上，沒有正確地自己的想法傳達清楚。

所以接下來我會從幾個層面來討論測試該怎寫，將我想表達的觀念重新整理一下。

<!-- more -->

## 為什麼這樣寫測試有問題

起因就是原文的這個範例，這是它的待測目標：

```php // simple_add_test.php
<?php
$arg1 = $_GET['arg1'];
$arg2 = $_GET['arg2'];
$return = (int)$arg1 + (int)$arg2;
echo $return;
```

測試程式是這樣寫的：

```php
<?php
// 把整個模擬測試流程寫成一個function，方便重用
function execute($arg1, $arg2){
    $_GET['arg1'] = $arg1;
    $_GET['arg2'] = $arg2;
    ob_start();
    include 'simple_add.php';
    return ob_get_clean();
}

$result = execute(1, 1);

if($result==2){
    echo "simple_add_test passed\n";
}else{
    echo "simple_add_test failed\n";
}

$result = execute(1, 2);

if($result==3){
    echo "simple_add_test passed\n";
}else{
    echo "simple_add_test failed\n";
}

$result = execute(1, -1);

if($result==0){
    echo "simple_add_test passed\n";
}else{
    echo "simple_add_test failed\n";
}

$result = execute(0, -1);

if($result==-1){
    echo "simple_add_test passed\n";
}else{
    echo "simple_add_test failed\n";
}
// 注意：後面的一大串if/else以及echo敘述，其實可以再包成function來簡化
```

如果這篇文章會繼續提到更嚴謹的做法，也許就不會有後續的討論了。事實上以往我在教測試時，也差不多是這樣開始的。只是整篇讀完後，我發現其實沒有任何後續 (雖然後來作者有提到會再寫) ，這才讓我開始擔心起來。

原本我想提的主要有兩點：

1. 這只是測試的初步觀念，但不是嚴謹的作法，更不是一種創意。

 當然在原文的範例裡，用 `if ==` 來驗證其實是沒有問題的；只是當你信任這個驗證方式，測試也通過了，天下就太平了嗎？如同作者自己提到的，我們有機會在自己寫的 assertion 中犯錯；而當你發現錯誤其實是在自己的驗證程式時，我想後續的除錯成本就不在話下了。這也是為什麼我一直強調就算是要用自己的驗證機制，也應該對它進行驗證。

 至於測試中的 assertion 寫錯，跟該不該用第三方 assertion library 其實是兩回事，這點後面我會說為什麼。

2. 測試案例不該寫在一起，這樣會讓初學者覺得寫測試反而導致更多問題。

 再次強調，這個範例沒有問題不表示可以用這個做法通吃所有的狀況。測試案例彼此應該是獨立的，也就是我們要讓每個測試案例在執行時都不受到前一個測試案例的影響，讓我們能單純驗證目標對象的邏輯在受控環境的結果。

 一個好的測試案例應該只測一件事，而一件事通常是只會測試目標邏輯一次。如果今天 `execute()` 的邏輯中會有可能影響下一次執行結果的狀況，那麼這樣的寫法就有可能發生連續的錯誤，而你就很難確定錯誤是在哪個測試案例中開始的。

## 測試裡不該有邏輯

有朋友說，所以這些驗證工具裡面也是有 `if` 及 `throw exception` 的邏輯呀！怎麼會說測試裡不該有邏輯？

這裡確實是我表達得不夠好的點，也是討論上我過於執著的地方。事實上在 assertion 中的這些邏輯，是被封裝起來的，對我們來說就是不需要在意的邏輯，我們只要知道它是具有可靠性的黑盒子即可。所以最前面原文的那個例子，在 assertion 沒有被封裝的狀況下， `if` 嚴格來說就必須算是測試案例裡的邏輯。

我瞭解這解釋有點過於嚴格了，但其實我有強力阻擋的理由：當初學者認為這裡可以用 `if` 來判斷時，通常就會毫無限制地使用了。這也就為什麼我們常說：雖然你可以這麼做，但你不該這麼做。

還是要再次強調，因為範例中的判斷邏輯只是簡單的 `==` ，所以看不出會有什麼影響；但這只是為了說明測試的原理，不代表實務上可以這麼做。

只是到底什麼是測試裡的邏輯？舉例來說 `try...catch` 就不該出現在測試案例裡，接收異常的機制應該是由測試框架來處理，我們要確保的是待測試邏輯「一定會拋出預期的異常」，而 `try...catch` 就有不確定的意味存在。

測試的目的就是確保該發生的一定要發生，而不是去判斷某件事會不會發生。如果測試案例中包含了不確定性的邏輯，那就不叫測試了。

## 測試只是輔助

有朋友提到 TDD 循環，其實我認為是在這個討論中有些失焦了。但不是說提出 TDD 是不對的，事實上我非常認同；只是我在這裡想討論的是「測試的寫法」，換句話說，就是在紅燈之前你怎麼寫測試案例。

TDD 有一個很重要的觀念：確保我們想清楚規格了才去動手。

我們寫測試通常是為了有測試而寫，只是想要驗證到底我們寫出來的程式碼對不對。但真正好的測試案例應該是以測試程式來描述規格。

回頭看一下原文範例的寫法：

```php
$result = execute(1, 1);

if($result==2){
    echo "simple_add_test passed\n";
}else{
    echo "simple_add_test failed\n";
}
```

當看到這個測試案例時，你知道原來的邏輯是做什麼的嗎？我想除了程式原作者之外，應該是沒人知道待測邏輯要做什麼吧？

「一個測試案例應該清楚描述待測對象的用途」，我們可以把測試案例想像成是 production code 的說明書，讓看到測試案例的人一眼就能明白該怎麼去使用待測對象。

之所以 assertion library 會封裝驗證的邏輯，除了提供可靠性之外，另一個目的就是提供較為語意化的 API 。例如 PHPUnit 的 `assertEquals` 、 `assertContains` 等，這些語義化的 API 很清楚地告訴我們要驗證的是什麼；如果用錯了，很有可能就是我們其實對需求理解得不夠明確。

那麼測試怎麼去描述需求呢？像是 JavaScript 的 mocha 框架就可以讓我們這樣寫：

```js
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      [1,2,3].indexOf(5).should.equal(-1);
      [1,2,3].indexOf(0).should.equal(-1);
    });
  });
});
```

像這樣就能清楚地表達陣列的 `indexOf` 方法可以怎麼用。你可以發現裡面其實沒有邏輯，因為「需求的 what 是不會有邏輯的，只有 how 才有邏輯。」

如果是原來的例子，如果萬不得已真的要自己寫驗證工具，可以寫成：

```php
<?php // my_test_tools.php

function runScriptWithQuery($script, $queryParams = [])
{
    $_GET = $queryParams;
    ob_start();
    require $script;
    return ob_get_clean();
}

function assertEquals($expected, $actual)
{
    if ($expected == $actual) {
        echo "Passed\n";
    } else {
        echo "Failed asserting that $actual matches expected $expected.\n";
    }
}
```

用法會是這樣：

```php
<?php // simple_add_test_cases.php
require 'my_test_tools.php';

function it_should_passed_with_1_add_2_equals_3()
{
    // Arrange
    $queryParams = ['arg1' => 1, 'arg2' => 2];
    $expected = 3;

    // Act
    $actual = runScriptWithQuery('simple_add_test.php', $queryParams);

    // Assert
    assertEquals($expected, $actual);
}

it_should_passed_with_1_add_2_equals_3();
```

註：避免跟原來的 `simple_add_test.php` 混淆，測試程式我改名為 `simple_add_test_cases.php` 。

這樣就可以很清楚的知道我們要測試的是 `simple_add_test.php` ，它的用途也是一清二楚。對看測試程式的人來說，它就是一種「對需求的描述」而不是「對程式邏輯的測試」。

## 該不該用自動化測試框架

在討論中 Ricky 提到沒有 PHPUnit 是不是就不能做測試了？這樣在沒有 PHPUnit 之前的程式碼不就不合格了？當然不是，還是強調一點：用自己寫的驗證機制是沒問題的，只要你能確保它驗證出來的結果是可信任的。

例如 c9s 提到 PHP 原始碼裡的一支[測試](https://github.com/php/php-src/blob/master/tests/lang/004.phpt)：

```
--TEST--
Simple If/Else Test
--FILE--
<?php
$a=1;
if($a==0) {
    echo "bad";
} else {
    echo "good";
}
?>
--EXPECT--
good
```

事實上就是用到了 PHP 自帶的測試程式 ([`run-tests.php`](https://github.com/php/php-src/blob/master/run-tests.php)) ，因為在測試 PHP 語法這個需求當初並沒有適合的自動化測試框架，所以 PHP 需要自己建立一個。

註：要注意這個測試的對象是 `if..else` 這個語法，並不是指 `if..else` 就是用來做驗證的機制。

那為什麼我們還是需要 PHPUnit 或其他自動化測試框架？除了公認的可靠性之外，主要是它提供了我們在測試上很多重要的機制：

1. 自動化驗證：你可以專注在寫測試，該批次執行的事情框架都會幫你處理好。
2. 隔離測試：模擬待測試邏輯中被隔離出去的相依物件。
3. 程式碼測試涵蓋率：確保測試有測到待測邏輯。
4. 與其他開發工具的整合：例如 IDE 、 CI Service 等，以造就完整的開發生態圈。

這些都是真正實務上經過千錘百鍊後的特色，也適用在絕大多數的 PHP 專案上。如果專案沒有特別的需求，當然是優先使用別人寫好自動化測試框架。

## 結論

我一直很強調測試的重要性，但並不是要讓它變成我們開發上的負擔，而是用來輔助我們很快地去驗證我們的程式碼是否符合了需求。也就是說我們不要為了只是要驗證程式的正確性而去寫測試，而是應該讓測試來協助我們去理解程式想要滿足什麼需求。

工具是手段沒錯，但它的目的就是要幫我們很快地去把一件事做好。今天如果自己寫的工具可以做到這件事，那當然是很好的。但如果已經有更好的工具，為什麼不直接使用呢？當然工具會出錯，但 open source 的好處就是讓我們有機會去修補它們。當工具的公正性已經接受過時間的考驗以及許多案例的檢驗，我想那都會比你花時間自己弄一套來得嚴謹很多。

當然每個人心中對測試有自己的定見，我很難說服每一個人。但還是希望讓大家可以重新思考一下測試的本質，在正確的地方轉彎。
