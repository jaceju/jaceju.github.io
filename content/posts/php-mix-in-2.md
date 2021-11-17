---
title: '我也來實作 PHP mix-in 的概念 - Part 2'
date: 2007-03-14T00:00:00+08:00
tags:
  - PHP
---

[石頭成](http://blog.roodo.com/rocksaying)老大說他要為他的 [mix-in](http://blog.roodo.com/rocksaying/archives/2817003.html) 實作 part 2 ，我也想到了一些好玩的東西。記得很久之前我寫過一篇「 [PHP 的 callback 虛擬型態](http://www.jaceju.net/blog/archives/32)」，這次就把它用在這裡。

<!-- more -->

首先我把原來的 Prototype 類別加上了可以接受 callback 虛擬型態的參數：

```
<?php
/**
* 實作 mix-in 概念
*
* 參考
* http://personal.schmalls.com/2006/11/06/prototype-based-programming-in-php/
* http://blog.roodo.com/rocksaying/archives/2817003.html
* http://blog.roodo.com/jaceju/archives/2832709.html
* http://blog.roodo.com/jaceju/archives/409709.html
**/
// 可接受 mix-in 物件的抽象類別
abstract class Prototype
{
    private function __set($name, $func)
    {
        if (is_array($func)) {
            if (is_object($func[0]) || (is_string($func[0]) &amp;&amp; class_exists($func[0]))) {
                $this->$name = array ($func[0], $func[1]);
            }
        } else {
            $this->$name = $func;
        }
    }
    private function __call($method, $args)
    {
        if (is_array($this->$method)) {
            call_user_func_array($this->$method, $args);
        } elseif (is_string($this->$method)
                &amp;&amp; class_exists($this->$method)
                &amp;&amp; is_subclass_of($this->$method, 'MethodObject')) {
            $method_object = new $this->$method($this);
            call_user_func_array(array ($method_object, 'run'), $args);
        }
    }
}

```

然後把 MethodObject 的 doWork 抽象方法改命名為 run ，這樣感覺比較對味。

```
<?php
// mix-in 方法的抽象類別
abstract class MethodObject
{
    protected $object;
    public function __construct($object = NULL)
    {
        $this->object = $object;
    }
    abstract function run();
}

```

而 ClassA 是一個普通的類別，擁有 method1 和 method2 兩個方法。

```
<?php
class ClassA
{
    public function method1($param)
    {
        echo __CLASS__, "\n";
        echo "param is ", $param, "\n";
    }
    public function method2($param)
    {
        echo __METHOD__, "\n";
        echo "param is ", $param, "\n";
    }
}

```

至於 ClassB 是繼承自 Prototype 類別，可以為它添油加醋；這裡我讓它保持清白之身就好。

```
<?php
class ClassB extends Prototype
{
}

```

ClassC 則繼承自 MethodObject ，當做是功能較複雜的函式物件。也就是說 ClassC 可以有自己的私有屬性或是私有方法，讓 run 方法過於龐大時，有重構的空間。

```
<?php
class ClassC extends MethodObject
{
    public function run()
    {
        $n = func_num_args();
        echo (1 == $n) ? func_get_arg(0) : '', "\n";
    }
}

```

最後就是測試程式碼了，可以看到 ClassB 生成的 $b 物件可以接受 callback 型態的陣列變數做為執行函式。

```
<?php
// 測試用的程式碼
$a = new ClassA;
$b = new ClassB;
$b->method1 = array ('ClassA', 'method1');
$b->method2 = array ($a, 'method2');
$b->method3 = 'ClassC';
$b->method1('param1');
$b->method2('param2');
$b->method3('param3');

```

這樣一來，當 ClassB 需要某個方法，而 ClassA 已經有實作了，那麼我們就可以直接利用 ClassA 的實作。只是這樣程式交互的結果，也許會使得設計上出現很大的漏洞，使用上要特別注意。

當然這只是概念性的實作而已，歡迎大家一起來討論看看。