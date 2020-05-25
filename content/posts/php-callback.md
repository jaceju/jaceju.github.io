---
title: 'PHP 的 callback 虛擬型態'
date: 2005-08-25 00:00:00 +08:00
tags: ["PHP"]
---

PHP 提供了一種很有趣的虛擬型態 (Pseudo-type) : callback ，它其實是字串或陣列組成。主要用來處理一些有不容易寫死在程式裡的函式名稱。

<!-- more -->

它可以是以下寫法：

```
// 呼叫函式，相當於 functionName();
'functionName'
// 呼叫類別靜態方法，相當於 className::methodName();
array ('className', 'methodName');
// 呼叫物件方法，相當於 $object->methodName();
array ($object, 'methodName');

```

例如：

```
<?php
$ary = array (
    'abc',
    'def',
    'ghi',
    array (
        '123',
        '456',
        '789',
    ),
);
function doSomething(&amp; $v)
{
    $v = 'f : ' . $v;
}
class TestClass
{
    public function doSomething(&amp; $v)
    {
        $v = 'c : ' . $v;
    }
}
$test = new TestClass();
var_dump(call_user_func('doSomething', 123));
var_dump(call_user_func(array ('TestClass', 'doSomething'), 123));
var_dump(call_user_func(array ($test, 'doSomething'), 123));
array_walk_recursive($ary, 'doSomething');
var_dump($ary);
array_walk_recursive($ary, array ('TestClass', 'doSomething'));
var_dump($ary);
array_walk_recursive($ary, array ($test, 'doSomething'));
var_dump($ary);
?>

```
