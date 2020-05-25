---
title: '我也來實作 PHP mix-in 的概念 - Part 3'
date: 2007-03-27 00:00:00 +08:00
tags: ["PHP"]
---

## 說明

石頭成老大把他心目中的 mix-in [目標](http://blog.roodo.com/rocksaying/archives/2884871.html)做出來了，他主要的實作有以下兩個重點：

* 物件實體生成後彼此做 mix-in 是不相干的。
* 類別方法在動態委派後要能遵守繼承原則，也就是說子承父、父不承子。


另外他也提到要儲存方法是一件困難的事情，因為 PHP 有三種函式的呼叫方法：一般函數、類別靜態方法、實例方法。而我在 [Part 2](http://blog.roodo.com/jaceju/archives/2853761.html) 裡的概念實作則是用 [callback](http://blog.roodo.com/jaceju/archives/409709.html) 虛擬型態來儲存，不過<a href="http://blog.roodo.com/jaceju/archives/2853761.html" title="前一版"></a>卻忘了把一般函式給放進去。

不過 Part 2 的實作已經實現了第一個目標，所以在這次 Part 3 的實作裡，我除了決定把一般函式也納入 mix-in 的實作裡，而且還要達成石頭成老大說的第二個目標。

<!-- more -->

另外我自己也加入了以下實作重點：

<li>所有動作都要在 Prototype 類別裡處理掉，不能夠讓子類別除了自己的工作外，還得實作不必要的部份。 (石頭成老大抱歉啦~我是覺得 <span><span class="vars">$methods</span> <span>不應該在子類別再次定義。)</span></span></li>
<li><span><span>Prototype&nbsp; 所延伸的子類別，不能覆蓋 Prototype 類別裡的任何方法，以避免功能出錯。</span></span></li>
<li><span>使用的方法要夠簡單，儘量不要讓使用者感到困惑。</span></li>


經過一番努力，我終於試出來了；先來看看成果，後面我才來一一分析。

## 可以 mix-in 方法的測試類別

首先我定義一個繼承自 Prototype 的類別稱為 ParentClass ：

```
// 繼承自 Prototype 的類別
class ParentClass extends Prototype
{
    public function method7($param)
    {
        echo get_class($this), '::method7';
        echo "(", $param, ")\n";
        echo "\n";
    }
}

```

註：可以 mix-in 的抽象類別我還是稱為 Prototype ，它必須被其他類別繼承，而無法獨自生成實體。

為了要實現石頭成老大的第一個目標，我再新增三個類別如下：

```
// 測試用的 Prototype 子類別 1
class ChildClass1 extends ParentClass
{
}
// 測試用的 Prototype 子類別 2
class ChildClass2 extends ParentClass
{
    public function __construct()
    {
    parent::__construct();
    echo "I'm " . __CLASS__ . '!!', "\n";
    }
}
// 測試用的 Prototype 子類別 3
class ChildClass3 extends ChildClass1
{
}

```

這裡 ChildClass1 和 ChildClass2 都繼承自 ParentClass ，而 ChildClass3 則繼承自 ChildClass1 ，而且它們也都是 Prototype 的子類別。

## 可用來做 mix-in 的 Callback 函式

接下來我要準備可以當成 callback 的函式與類別，這裡分成一般函式、類別函式及 MethodObject 物件。

不過上次的 MethodObject 類別名稱我覺得還是不太好，這次我改用 Callback 這個名稱，但實際上它的功能還是一樣：

```
// mix-in 方法的抽象類別
abstract class Callback
{
    protected $object;
    public function __construct($object = NULL)
    {
        $this->object = $object;
    }
    abstract function run();
}

```

不過抽象類別是無法產生實體的，所以和前一版相同，我用一個 TestMethod 類別來繼承 Callback ：

```
// 方法類別
class TestMethod extends Callback
{
    public function run()
    {
        $n = func_num_args();
        echo __METHOD__;
        echo '(', (1 == $n) ? func_get_arg(0) : '', ")\n";
        echo "\n";
    }
}

```

然後是一個普通的類別 Util ，並提供了兩個公開方法：

```
// 一般類別
class Util
{
    public function method1($param)
    {
        echo __METHOD__;
        echo "(", $param, ")\n";
        echo "\n";
    }
    public function method2($param)
    {
        echo __METHOD__;
        echo "(", $param, ")\n";
        echo "\n";
    }
}

```

最後是兩個函式 normalFunc1 及 normalFunc2 ，它們就是一般的自訂函式而已：

```
// 一般函式
function normalFunc1($param)
{
    echo 'normalFunc1(' . $param, ")\n";
    echo "\n";
}
function normalFunc2($param, $object = NULL)
{
    echo 'normalFunc2(' . $param, ")\n";
    var_export($object);
    echo "\n";
}

```

## 測試結果

現在重頭戲來了，我先把需要的 callback 變數準備好：

```
// 測試用的程式碼
$a = new Util();
$callback1 = array ('Util', 'method1');
$callback2 = array ($a, 'method2');
$callback3 = 'TestMethod';
$callback4 = array ('TestMethod', 'run');
$callback5 = 'normalFunc1';
$callback6 = 'normalFunc2';

```

這裡分成 $callback1 到 $callback6 ，其中 $callback3 和 $callback4 其實是一樣的，只不過寫法不同而已。

先來看看石頭成老大要的第二個目標，在我這裡是怎麼做的：

```
Prototype::delegate('ParentClass::method4', $callback4);
Prototype::delegate('ChildClass1::method5', $callback5);

```

和石頭成老大的作法不同，我在 Prototype 定義了一個靜態的 delegate 函式，然後用上面的方法來指定靜態的 mix-in 。本來我想是直接用 <strong>ParentClass::delegate('method4', $callback)</strong> 這種方式來完成，不過 <strong>PHP 並沒有辦法在繼承下來的靜態函式裡取得該類別的類別名稱</strong>，所以這裡我想還是透過 Prototype 來完成，而這也符合我自己的第一個實作重點。

這裡要注意一點，那就是這時我已經將 $callback4 混入 ParentClass ，此時 ParentClass 除了自己的 <strong>method7</strong> 方法外，還會有 <strong>method4</strong> 方法共兩個方法。而 $callback5 則是混入 ChildClass1 ，又因為 ChildClass1 繼承自 ParentClass ，所以 ChildClass1 就會有三個方法： <strong>method4</strong> 、 <strong>method5</strong> 、 <strong>method7</strong> 。

接下來我先把 ParentClass 和 ChildClass 的實體產生出來，分別是 $parent1 和 $child1 。然後我再一次把 $callback6 混入 ParentClass ，接著再建立 $parent2 、 $child2 與 $child3 等三個分別為 ParentClass 、 ChildClass2 和 ChildClass3 類別的實體。

```
$parent1 = new ParentClass;
$child1 = new ChildClass1;
Prototype::delegate('ParentClass::method6', $callback6);
$parent2 = new ParentClass();
$child2 = new ChildClass2();
$child3 = new ChildClass3();

```

猜猜看，這時 $parent1 這個物件實體能夠呼叫 method6 這個方法嗎？如果不行，那 $parent2 呢？而 $child2 和 $child3 裡混入的方法又有哪些呢？

在我的想法裡，因為 method6 的混成是在 $parent1 產生之後，所以 $parent1 並沒有辦法呼叫 method6 (符合石頭成老大的要求) ；不過 $parent2 就可以了，因為它是在混成 method6 以後才建立的。

另外 $child2 因為繼承自 ParentClass ，而且還是在 method6 混入後才建立的，所以它就會有 <strong>method4</strong> 、 <strong>method6</strong> 和 <strong>method7</strong> 三個方法可用。再看 $child3 ，因為它繼承了 ChildClass1 ，所以就會有 <strong>method4</strong> 、 <strong>method5</strong> 、 <strong>method6</strong> 與 <strong>method7</strong> 。

搞混了嗎？我想應該還不至於，現在我再把第一版的 mix-in 方式加進來：

```
$parent1->method1 = $callback1;
$parent1->method2 = $callback2;
$parent1->method3 = $callback3;

```

注意這裡 $callback1 、 $callback2 和 $callback3 是直接混入 $parent1 這個物件實體，所以 $parent2 、 $child1 、 $child2 與 $child3 是沒辦法呼叫 method1 、 method2 及 method3 的 (石頭成老大的第一個目標) 。

好了，現在來試試呼叫 $parent1 的方法；猜猜看哪些方法是能運作的？

```
try
{
    $parent1->method1('param1');
    $parent1->method2('param2');
    $parent1->method3('param3');
    $parent1->method4('param4');
    $parent1->method5('param5');
    $parent1->method6('param6');
    $parent1->method7('param7');
} catch (Exception $e) {
    echo $e, "\n";
}

```

只有 method1 、 method2 、 method3 、method4 及 method7 才能運作，猜對了嗎？

註：這裡的 try 寫法其實有點不太對，因為在呼叫 method5 而出現 Exception 後就會跳出 try 區塊了。我是利用註解讓它繼續往下做，下面的範例也是相同，這裡請大家別太在意。

同樣的方法再來試試 $parent2 、 $child1 、 $child2 及 $child3：

```
try
{
    $parent2->method1('param1'); // Exception!!
    $parent2->method2('param2'); // Exception!!
    $parent2->method3('param3'); // Exception!!
    $parent2->method4('param4'); // Work!!
    $parent2->method5('param5'); // Exception!!
    $parent2->method6('param6'); // Work!!
    $parent2->method7('param7'); // Work!!
} catch (Exception $e) {
    echo $e, "\n";
}
try
{
    $child1->method1('param1'); // Exception!!
    $child1->method2('param2'); // Exception!!
    $child1->method3('param3'); // Exception!!
    $child1->method4('param4'); // Work!!
    $child1->method5('param5'); // Work!!
    $child1->method6('param6'); // Exception!!
    $child1->method7('param7'); // Work!!
} catch (Exception $e) {
    echo $e, "\n";
}
try
{
    $child2->method1('param1'); // Exception!!
    $child2->method2('param2'); // Exception!!
    $child2->method3('param3'); // Exception!!
    $child2->method4('param4'); // Work!!
    $child2->method5('param5'); // Exception!!
    $child2->method6('param6'); // Work!!
    $child2->method7('param7'); // Work!!
} catch (Exception $e) {
    echo $e, "\n";
}
try
{
    $child3->method1('param1'); // Exception!!
    $child3->method2('param2'); // Exception!!
    $child3->method3('param3'); // Exception!!
    $child3->method4('param4'); // Work!!
    $child3->method5('param5'); // Work!!
    $child3->method6('param6'); // Work!!
    $child3->method7('param7'); // Work!!
} catch (Exception $e) {
    echo $e, "\n";
}

```

運作方式就如同上面註解所示。

這樣一來，所有的測試結果都符合石頭成老大的目標以及我自己所要求的重點。要注意的事項我也不再多提了，請自行參考石頭成老大的文章，以及我前面的說明。

另外或許大家會注意到，為什麼我都是利用物件來呼叫 mix-in 方法，而不是使用靜態呼叫。這是因為 PHP 也沒提供靜態的 __call 魔術方法，所以這裡並沒辦法用 ParentClass::method1() 這樣的語法，這是此法美中不足的地方。

## 主角 Prototye 類別

最後來看看我是如何實作 Prototype 類別的，這裡我提出幾個重點：

* 因為類別方法和實體方法是不同的，所以我將它們分開存放；等到物件生成時，再將它們依照繼承關係合併在一起。
* 執行時期， Prototype 類別的 __call 魔術方法只執行實體方法。


先看看 Prototype 的屬性成員宣告：

註：從以下程式開始到文章的最後，除了說明文字外的程式區塊都是屬於 Prototype 類別的程式碼範圍。

```
// 可接受 mix-in 物件的抽象類別
abstract class Prototype
{
    const PROTOTYPE_METHOD = 0;
    const INSTANCE_METHOD = 1;
    const CALLBACK_LENGTH = 2;
    public static $class_methods = array ();
    public $instance_methods = array ();

```

這裡我定義了兩個存放 mix-in 方法的 陣列， $class_method 用以存放類別 mix-in 方法，而 $instance_methods 則是存放該實體的 mix-in 方法，這個和石頭成老大的想法相似；另外 PROTOTYPE_METHOD 和 INSTANCE_METHOD 則是用來表示該 mix-in 方法是屬於類別方法還是實體方法，後面的 setCallback 方法會用到。

先看 Prototype 的 delegate 方法：

```
    public final function delegate($name, $callback)
    {
        $class_name = '';
        $method_name = '';
        $delegate = explode('::', $name);
        if (Prototype::CALLBACK_LENGTH == count($delegate)) {
            list($class_name, $method_name) = $delegate;
        } else {
            throw new Exception('Syntax error!!');
        }
        $class_name = strtolower($class_name);
        if (!class_exists($class_name)) {
            throw new Exception("Class $class_name not exists!!");
        }
        if (!is_subclass_of($class_name, __CLASS__)) {
            throw new Exception("Class $class_name not subclass of " . __CLASS__ . "!!");
        }
        self::setCallback($class_name, $method_name, $callback, Prototype::PROTOTYPE_METHOD);
    }

```

delegate 要做的事情很簡單，就是將 callback 虛擬型態變數放到 $class_methods 中對應的類別裡；換句話說，我在 $class_methods 裡會把繼承自 Prototype 的類別都用一個陣列來存放。另外我也希望 delegate 方法是不能被子類別所推翻的，所以我使用 final 關鍵字來宣告它。

而存放的 setCallback 方法如下：

```
    private final function setCallback($class_name, $method_name, $callback, $method_type)
    {
        if (is_array($callback)) {
            if (is_object($callback[0])
                    || (is_string($callback[0])
                    &amp;&amp; class_exists($callback[0]))) {
                $callback = array ($callback[0], $callback[1]);
            }
        }
        if (is_callable($callback) ||
                (class_exists($callback) &amp;&amp; is_subclass_of($callback, 'Callback'))) {
            if (Prototype::PROTOTYPE_METHOD == $method_type) {
                self::$class_methods[$class_name]($method_name) = $callback;
            } elseif (Prototype::INSTANCE_METHOD == $method_type) {
                $this->instance_methods[$method_name] = $callback;
            }
        }
    }

```

因為 setCallback 只在 Prototype 裡被使用，所以宣告成 private final 。 setCallback 方法會依照指定的類型，把 callback 放在對應的 method 陣列裡。另外我還在石頭成老大那邊也學會 is_callable 函式的用法 (發現自己以前好蠢) ， 這樣看起來程式就比之前自己判斷 callback 型態來得簡單多了。

然後是 Prototype 類別的重點，因為石頭成老大的程式給我一個啟發，利用 for 迴圈我可以<strong>推展出目前類別的繼承關係，進而把所有父類別的類別 mix-in 方法全部合併到目前物件實體裡的 mix-in 方法陣列中</strong>。

```
    public function __construct()
    {
        $current_class = strtolower(get_class($this));
        $this->instance_methods = array ();
        for ($class_name = $current_class;
                $parent_name = strtolower(get_parent_class($class_name));
                $class_name = $parent_name) {
            if (isset(self::$class_methods[$class_name])) {
                $this->instance_methods = array_merge(
                $this->instance_methods,
                self::$class_methods[$class_name]);
            }
        }
    }

```

這裡 get_parent_class 函式會幫我們把指定類別的上一層父類別找出來；知道這個方式後，再仔細看看 for 迴圈裡的寫法，就會發現石頭成老大真的很神 (這是從他的程式裡偷來的 XD ) 。

相對之下， __set 魔術方法就很簡單了：

```
    private final function __set($method_name, $callback)
    {
        $class_name = strtolower(get_class($this));
        self::setCallback($class_name, $method_name, $callback, Prototype::INSTANCE_METHOD);
    }

```

這裡就是取得目前類別的名稱，然後再交由 setCallback 去處理。

接下來是 __call 魔術方法：

```
    private final function __call($callback, $args)
    {
        if (isset($this->instance_methods[$callback])) {
            $callback = $this->instance_methods[$callback];
            $this->executeCallback($callback, $args);
            return;
        }
        throw new Exception(get_class($this) . "::$callback is not exists!");
    }

```

它也非常簡單，就是找出對應的實體 mix-in 方法，並交由 executeCallback 方法來執行。

最後是 executeCallback 方法，也是仿照 setCallback 的方式，只不過它是執行 callback 。

```
    private final function executeCallback($callback, $args)
    {
        $args[] = $this;
        if (is_callable($callback)) {
            call_user_func_array($callback, $args);
        } elseif (class_exists($callback)
                &amp;&amp; is_subclass_of($callback, 'Callback')) {
            $method_object = new $callback($this);
            call_user_func_array(array ($method_object, 'run'), $args);
        }
    }
} // End of Prototype

```

特別注意一點，我把 Prototype 物件實體放在 $args 的最後一個，這樣如果像 normalFunc2 這樣的函式被混入的話，就可以存取到這些物件實體了。

## 後記

雖然我覺得這些方法有時候會令人迷惑，不過其實它也有好用的一面。這裡我也向石頭成老大學習到很多特別的技巧，也讓我自己對靜態變數與實體變數之間有更深的瞭解。

PHP 也許不像 Ruby 的語法那樣地富有變化性，不過我想只要應用得當， PHP 還是能夠發展出屬於自己的特性的。
