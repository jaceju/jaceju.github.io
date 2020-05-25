---
title: 'PHP 裡的 Prototype-based 開發手法'
date: 2006-11-10 00:00:00 +08:00
tags: ["PHP"]
categories:
    - PHP
---

上次介紹了一篇 [Bring some Ruby/Prototype flavour in your PHP array](http://hasin.wordpress.com/2006/10/17/bring-some-rubyprototype-flavour-in-your-php-array/)  ，這次有個類似的。

文章網址： [Prototype-based programming in PHP](http://personal.schmalls.com/2006/11/06/prototype-based-programming-in-php/)

<!-- more -->

原文轉載如下：
<blockquote>

For those who have been doing a lot of Javascript programming, you know what prototype-based programming is all about. The basic idea is that functions can be added to classes dynamically. In Javascript functions can be added to a static class (using prototype) and it will be added to all instances of the class, or they can be added to a specific instance and only be added to that instance.

Anyway, lets get to the point. I decided to try adding this functionality to PHP. I'm not sure why its a good idea, or if it even is, but I'll let you be the judge of that. So here is the class I came up with:

```php
/**
 * @copyright   &amp;#169; 2006, Schmalls / Joshua Thompson, All Rights Reserved
 * @license	 http://www.opensource.org/licenses/bsd-license.php New BSD
 * @author	  Joshua Thompson <spam.goes.in.here@gmail.com>
 * @version	 1.0.0
 * @link		http://www.countercubed.com
 */
/**
 * This class holds the prototype capabilities
 *
 * Extending this class makes it prototype capable
 */
class Prototype
{
    /**
     * Holds prototype functions
     *
     * @var  array
     */
    private $_functions = array();
    /**
     * Default constructor
     *
     * This is here so that php doesn't complain about the prototype function
     */
    public function __construct()
    {
    }
    /**
     * Sets the prototype functions or variables
     *
     * @param   string $name
     * @param   mixed $value
     */
    public function __set( $name, $value )
    {
        if ( function_exists( $value ) ) :
            $this->_functions[$name] = $value;
        else :
            $this->$name = $value;
        endif;
    }
    /**
     * Gets static prototype variables if they exist
     *
     * @param   string $name
     * @return  mixed
     */
    public function __get( $name )
    {
        if ( isset( $this->prototype()->$name ) ) :
            return $this->prototype()->$name;
        else :
            trigger_error( 'Undefined property: ' . __CLASS__ . '::' . $name, E_USER_NOTICE );
        endif;
    }
    /**
     * Calls a static prototype function
     *
     * @param   string $name
     * @param   array $arguments
     * @return  mixed
     */
    public function __call( $name, $arguments )
    {
        if ( isset( $this->_functions[$name] ) ) :
            return call_user_func_array( $this->_functions[$name], $arguments );
        elseif ( $this->prototype()->isCallable( $name ) ) :
            return call_user_func_array( array( $this->prototype(), $name ), $arguments );
        else :
            trigger_error( 'Call to undefined method ' . __CLASS__ . '::' . $name . '()', E_USER_ERROR );
        endif;
    }
    /**
     * Returns the static prototype holder
     *
     * @return  Prototype
     */
    public static function prototype()
    {
        static $prototype = null;
        if ( $prototype === null ) :
            $prototype = new Prototype();
        endif;
        return $prototype;
    }
    /**
     * Needed for the static calling functionality
     *
     * @return  boolean
     */
    public function isCallable( $name )
    {
        return ( isset( $this->_functions[$name] ) );
    }
}

```

Now all a class needs to do is extend the Prototype class. A sample of its use follows:

```php
// make some prototype classes
class Test1 extends Prototype
{
}
class Test2 extends Prototype
{
}
class Test3 extends Test1
{
}
// lets create some test static functions
Test1::prototype()->fun1 = create_function( '$arg1', '
    echo \'Static Test1::fun1 \' . $arg1 . "\n";
');
Test2::prototype()->fun2 = create_function( '$arg1', '
    echo \'Static Test2::fun2 \' . $arg1 . "\n";
');
// now instantiate the objects
$test1 = new Test1();
$test2 = new Test2();
// and make some more functions
$test1->fun3 = create_function( '$arg2', '
echo \'Test1::fun3 \' . $arg2 . "\n";
');
$test2->fun4 = create_function( '$arg2', '
echo \'Test2::fun4 \' . $arg2 . "\n";
');
// output: Static Test1::fun1 bob
$test1->fun1( 'bob' );
// create another function
Test1::prototype()->fun2 = create_function( '$arg1', '
echo \'Static Test1::fun2 \' . $arg1 . "\n";
');
// output: Static Test1::fun2 bobby
$test1->fun2( 'bobby' );
// output: Static Test2::fun2 robert
$test2->fun2( 'robert' );
// output: Test1::fun3 robby
$test1->fun3( 'robby' );
// output: Test2::fun4 rob
$test2->fun4( 'rob' );
// another instance still has the static functions
$test1_2 = new Test1();
// output: Static Test1::fun1 bob
$test1_2->fun1( 'bob' );
$test3 = new Test3();
// this will give an error because prototype functions do not extend down to a child class
$test3->fun1( 'roberto' );
```

Once again, I don't know how useful it is, but let me know what you think.
</blockquote>

主要的概念是用 PHP5 的 magic methods ： `__set` 、 `__get` 、 `__call` 。

利用 `__set` 及物件內部的 _functions 變數記住 `create_function` 所產生出來的 callback 匿名函式，然後再用 `__call` 呼叫這些動態建立的 methods 。

當然 magic methods 必須在物件實體產生後才能使用，詳細的說明可以參考一下該文回應的部份。
