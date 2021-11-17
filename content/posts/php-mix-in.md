---
title: '我也來實作 PHP mix-in 的概念'
date: 2007-03-10T00:00:00+08:00
tags:
  - PHP
---

之前提過一篇 [Prototype-based programming in PHP](http://personal.schmalls.com/2006/11/06/prototype-based-programming-in-php/) ，後來在[石頭閒語](http://blog.roodo.com/rocksaying)那裡也看到 [PHP 實踐 mix-in 概念之可行性](http://blog.roodo.com/rocksaying/archives/2817003.html)，我自己也手癢寫了一個。不過我是把 function 當成是一個 MethodObject ，有點 delegate 味道。然而大部份限制就像石頭成所說的，所以我也不多提了。還是等 PHP7 的規格出來，看它會不會[支援 closure](http://javaworld.com.tw/roller/page/ingramchen?entry=2007_1_1_WhyAddClosureInJava7) 好了  (要跟隨 Java 7 嗎？ XD) 。

註： PHP 6 可能會實現的東西請參考 [Prepare for PHP 6](http://www.corephp.co.uk/archives/19-Prepare-for-PHP-6.html) 。

<!-- more -->

程式如下：

```
<?php
/**
 * 實作 mix-in 概念
 *
 * 參考
 * http://personal.schmalls.com/2006/11/06/prototype-based-programming-in-php/
 * http://blog.roodo.com/rocksaying/archives/2817003.html
 **/
// 可接受 mix-in 物件的抽象類別
abstract class Prototype
{
    private function __set($name, $value)
    {
        $this->$name = $value;
    }
    private function __call($method, $args)
    {
        if (class_exists($this->$method)) {
            $method_object = new $this->$method($this);
            call_user_func_array(array ($method_object, 'doWork'), $args);
        }
    }
}
// mix-in 方法的抽象類別
abstract class MethodObject
{
    protected $object;
    public function __construct($object = NULL)
    {
        $this->object = $object;
    }
    abstract function doWork();
}
// 測試用的 Person 類別
class Person extends Prototype
{
    private $name;
    public function __construct($name)
    {
        $this->name = $name;
    }
    public function getName()
    {
        return $this->name;
    }
    public function __toString()
    {
        return $this->name;
    }
}
// 測試用的 Car 類別
class Car extends Prototype
{
    private $owner;
    public function setOwner(Person $person)
    {
        $this->owner = $person;
    }
    public function __toString()
    {
        return 'This is ' . $this->owner->getName() . '\'s car.';
    }
}
// 測試用的 PrintString 類別
class PrintString extends MethodObject
{
    public function doWork()
    {
        $n = func_num_args();
        echo $this->object, (1 == $n) ? func_get_arg(0) : '';
    }
}
// 測試用的程式碼
$me = new Person('Jace');
$me->printName = 'PrintString';
$me->printName(' Say: ');
$my_car = new Car;
$my_car->setOwner($me);
$my_car->printCarName = 'PrintString';
$my_car->printCarName();

```

有沒有用我也不清楚，我的實務經驗太少，沒辦法想到它的用途。不過反正只是寫好玩的，也許能激發別人的靈感也說不一定。