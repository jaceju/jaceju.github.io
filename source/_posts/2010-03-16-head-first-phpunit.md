---
layout: post
title: 'PHPUnit 實務入門簡介'
date: 2010-3-16
wordpress_id: 1062
comments: true
tags: ["PHP", "測試"]
---

註：本文所提及的觀念與技巧已經不適用在目前的 PHPUnit ，這裡只是為了記錄自己學習過的心得。

這幾天在寫折價券攤提到商品的數學演算法邏輯，搞得我七葷八素的...還好先前在製作購物車時，已經把單元測試放到架構裡，因此後面就只要專心應付演算法邏輯就好了。

雖然這樣的規劃聽起來不錯，但單元測試這件事說到底我的實務經驗還是太少，在這次的專案項目裡，才讓我真正有了較為深入的體會。

<!--more-->

## 先對要測試的事情有一個概觀

其實測試一開始真的很難下手，主要是因為我們不知道我們要測些什麼東西。因此，我們需要對需要測試的東西有個概觀。

就以這次的例子來說吧，我要測試的東西就是「折價券攤提的演算法邏輯」，那它裡面重要的東西是什麼？

在跟客戶討論，我們得知折價券面額要分攤到的商品上時有一定的規則；這時我們就要先在紙上作業，用簡單的例子跟客戶確認清楚規則。

[![草圖](/resources/phpunit/draft.jpg)](/resources/phpunit/draft.jpg)

確認了方向之後，因為我之前已經測試架構準備好了，所以接下來就只要針對要測試的部份撰寫程式碼即可。但如果一開始還沒有準備好測試架構的話，這裡給大家幾個建置環境的簡易流程：

* 在專案裡開個 `tests` 資料夾，這裡就是放置測試案例的地方。

* 準備一個 `init.php` ，目的是用來設置 `include_path` 及 `autoload` 機制。

* 按照 PHPUnit 官方的建議，建立一個 AllTests.php 的 Test Suite 。

註：這裡我就不列出程式碼了，讓大家自己試試看。

然後每次測試就用以下指令即可：

```php
> phpunit AllTests.php
```

之後我會以「跑測試」來表示執行這個指令。

## 描繪程式的輪廓

接下來我們就要把整個系統的測試架構定義出來，不過這時候其實我們還沒開始寫程式，只是把流程和相關的方法先定義出來。

這裡的方法很簡單，就是先透過註解和方法介面來描述整個流程，而不是先寫細部的程式碼。

```php
class Shop_Cart_Plugin_Coupon extends Shop_Cart_Plugin
{
    // ... 略 ...
    // 演算法計算後的結果
    protected $_sharedCouponData = array();
    // 取得演算法計算後的結果，也可供測試來驗證
    public functino getSharedCouponData()
    {
        return $this->_sharedCouponData;
    }
    // 主要的執行方法
    public function doCheckout()
    {
        $this->_getCouponData(); // 取得
        $this->_getProductData(); // 取得商品資料
        $this->_initData(); // 初始化要攤提的資料
        $this->_shareCouponToProduct(); // 開始攤提
    }
    // ... 略 ...
}

```

當然這些都是大概的輪廓，因為可能在我們寫好測試執行時，會再額外加入新的方法及介面。

還有一個要先定義好的是測試用的比對數據格式，它對我們稍後要測試的程式寫法會有影響。

## 寫第一個測試

到這裡，我們就可以開始寫第一個測試，而接下來的程式碼，都是先以這個測試可以成功為目的。而這個測試要怎麼寫呢？就是把一開始我們在紙上作業的數字拿進來套用。

當然這裡我的 `setUp` 和 `tearDown` 也已經在之前準備測試架構時寫好了，它們會讓我們每次的測試數據都能夠獨立。我們關心的就是第一個測試案例：

```php
<?php
class Shop_Cart_Plugin_CouponTest extends PHPUnit_Framework_TestCase
{
    // ... 略 ...
    public function setUp()
    {
        // ... 略 ...
    }

    public function tearDown()
    {
        // ... 略 ...
    }

    public function testDoCheckout()
    {
        $this->_plugin->setValue(array(
           1 => 1, // C1, ProductCoupon for P1, $100
           2 => 2, // C2, ProductCoupon for P1, P2, $100
        ));

        $this->_cart->addItems(array(
            'P1' => 1, // $200
            'P2' => 1, // $300
        ))->refresh();

        $this->assertEquals(300, $this->_cart->getTotal());

        $this->_plugin->doCheckout();

        $resultDataList = $this->_plugin->getSelectedOrderCouponDataList();

        $this->assertEquals(-100, $resultDataList['P1-C1']('discountPrice'));
        $this->assertEquals(-25,  $resultDataList['P1-C2']('discountPrice'));
        $this->assertEquals(-75,  $resultDataList['P2-C2']('discountPrice'));
    }
}
```

這裡因為我們在上一步就定義好比對用的數據，所以測試時就是用這個輸出的數據來與我們預期的數字相比較。

接下來就先跑跑測試，看看這個 TestCase 有沒有執行錯誤的地方 (例如物件沒有正確初始化或是變數名稱誤寫等等) ；當然如果沒有出現預期值是正常的，因為我們根本還沒有寫計算公式。

## 繼續完成演算法

現在回到 `Shop_Cart_Plugin_Coupon` ，我們就要把剛剛那些只有骨頭的方法開始添血添肉，這裡就請大家自行發擇。

接著只要你覺得程式差不多了，就先跑一下測試，看看是不是符合測試的預期結果。

當你完成第一個測試時，程式的就差不多完成百分之五十啦，到這裡別忘了先把程式 commit 到版本控制系統裡。

## 加入新測試並修改程式

完成第一個測試時，當然不是沒事了，我們要針對不同的狀況再加入其他的測試數據。

這裡我們就可以開始考慮把第一個測試以 PHPUnit 提供的 Data Provider 改寫，讓我們不必重複過多的程式碼。

```php
<?php
class Shop_Cart_Plugin_CouponTest extends PHPUnit_Framework_TestCase
{
    // ... 略 ...
    public function setUp()
    {
        // ... 略 ...
    }

    public function tearDown()
    {
        // ... 略 ...
    }

    /**
     * @dataProvider provider
     */
    public function testDoCheckout($selectedCouponIdList, $productSkuNumberList, $total, $discountDataList)
    {
        $this->_plugin->setValue($selectedCouponIdList);
        $this->_cart->addItems($productSkuNumberList)->refresh();
        $this->assertEquals($total, $this->_cart->getTotal());
        $this->_plugin->doCheckout();
        $resultDataList = $this->_plugin->getSharedCouponData();
        foreach ($discountDataList as $key => $value) {
        	$this->assertEquals($value, $resultDataList[$key]('discountPrice'));
        }
    }

    public function provider()
    {
        return array( // 第一個測試
            array(array(
                1 => 1, // C1, ProductCoupon for P1, $100
                2 => 2, // C2, ProductCoupon for P1, P2, $100
            ), array(
                'P1' => 1, // $200
                'P2' => 1, // $300
            ), 300, array(
                'P1-C1' => -100,
                'P1-C2' => -25,
                'P2-C2' => -75,
            )),
            array( // 第二個測試
                // ... 略 ...
            ),
            // ... 略 ...
        );
    }
}

```

而加入新測試之後，就可以跑跑測試，看看我們剛寫好的演算法是否正確動作？通常這時候才真正是考驗的開始。因為這時候前面寫好的程式碼可能只對第一個測試正常，接下來的測試也許就會出錯了。

所以我們就會需要修改或重構程式碼，讓後面的測試也能正常執行。當然改過的程式也要讓第一個測試正常運作，才是正確的修改。

當然演算法寫好後，就要真正上到 Web 畫面去測試。至此，你會發現你花在寫測試上的心力都有了回報，因為通常如果你已經定義好介面，而這次的修改只是改寫一個小類別的話，那麼就會發現程式會非常順利地運作了。

## 心得

每次寫購物車時，最麻煩的就是測試時要開啟購物車網頁，把一個一個的商品加進來，再加入不同的折價券條件。而有單元測試之後，我就可以省去一大堆開啟網頁，點選連結的功夫，專心地撰寫計算邏輯，只能說單元測試真的個超級便利的工具呀。
