---
layout: post
title: '撰寫可以接受 callback 虛擬型態參數的函式'
date: 2005-9-8
wordpress_id: 33
comments: true
tags: ["PHP"]
---

前面介紹過 callback 虛擬型態，但不限於 PHP 內建函式，我們也可以在函式中自行處理 callback 虛擬型態的參數。

<!--more-->

例如 PHP 內建了一個 array_map 函式，但是無法處理多階陣列。我們可以自行建立一個 array_map_recursive 函式來使用，當然其介面也得和 array_map 一樣：

```
<?php
/**
 * 用法：
 * $a = array (1, 2, 3, 4, 5);
 * $a = array_map_recursive('function_name', $a); // callback function
 * $a = array_map_recursive(array ('class_name', 'class_method'), $a); // callback static class method
 * $a = array_map_recursive(array (&amp; $object, 'object_method'), $a); // callback object method
 */
function array_map_recursive($func, $arr)
{
    $result = array();
    foreach ($arr as $key => $value) {
        if (is_array($value)) {
            $result[$key] = array_map_recursive($func, $value);
        } else {
            if (is_array($func)) {
                if (is_object($func[0]))
                    $result[$key] = $func[0]->$func[1]($value);
                if (is_string($func[0]))
                    eval('$result[$key] = ' . $func[0] . '::' . $func[1] . '($value);');
            } else {
                $result[$key] = $func($value);
            }
        }
    }
    return $result;
}

```

其中 $func 參數就是 callback 虛擬型態。