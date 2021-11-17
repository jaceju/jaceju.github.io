---
title: '如何在 PHP 中平順地處理 Error 及 Exception ？'
date: 2010-04-23T00:00:00+08:00
tags:
  - PHP
  - 'Web 開發'
---

在開發 PHP 的時候，最麻煩的事情之一就是處理錯誤。一個好的程式除了要將錯誤訊息呈現給使用者知道之外，也要讓該結束的部份正常結束才行。

而在 PHP5 之後，除了以往的 Error Handling 之外，還多了 Exception Handling ，使得程式變得更難去處理錯誤；所以大多數的開發者只能雙手一攤，讓這些錯誤訊息大剌剌地出現在使用者面前。

有沒有什麼好方法可以讓我們好好控制 Error 和 Exception 呢？

<!-- more -->

## 傳統的做法

在很多書籍和網路範例裡，當程式出錯時就是讓程序直接死掉，最常見的就是資料庫連線：

```php
$link = mysql_connect('localhost', 'mysql_user', 'mysql_password');

if (!$link) {
    die('Could not connect: ' . mysql_error());
}

echo 'Connected successfully';
mysql_close($link);
```

或是在送出導向 header 後，就直接 exit ：

```php
header("Location: http://www.example.com/"); /* Redirect browser */
/* Make sure that code below does not get executed when we redirect. */
exit;
```

這些都不是好做法，因為有些流量較大的網站裡可能有多個資料庫連線，或是檔案的 handler 仍在開啟中；如果直接讓程序死亡或離開的話，就沒辦法將這些已經開啟的資源給正常關閉掉，進而造成系統的不穩定。

## Exception 的處理

PHP5 中，有個 [`set_exception_handler`](http://www.php.net/manual/en/function.set-exception-handler.php) 這個函式，它可以幫我們處理 Exception ：

```php
function exception_handler($exception)
{
    echo "Uncaught exception: " , $exception->getMessage(), "\n";
}

set_exception_handler('exception_handler');
throw new Exception('Uncaught Exception');
echo "Not Executed\n";
```

不過我個人認為用 [`try...catch`](http://www.php.net/manual/en/language.exceptions.php) 會讓我們在程式流程上的彈性更大：

```php
function inverse($x)
{
    if (!$x) {
        throw new Exception('Division by zero.');
    }
    else return 1/$x;
}

try {
    echo inverse(5) . "\n";
    echo inverse(0) . "\n";
} catch (Exception $e) {
    echo 'Caught exception: ',  $e->getMessage(), "\n";
}

// Continue execution
echo 'Hello World';
```

而在我研究過 Zend Framework 的做法後，發現它在處理 Exception 上更加聰明。 Zend Framework 在 Controller 中引入一個 Response 物件，所有對瀏覽器的輸出都要經過它 (例如 Header 、 Content Body 等等) ；而這個 Reponse 物件也同時控管著 Exception 是否要被輸出到瀏覽器端，讓程式開發者能有更大的空間處理 Exception 。

以下我簡單把 Zend Framework 在 Response 物件中處理 Exception 的概念整理成一個自製的 `Response` 類別：

```php
class Response
{
    private $_exceptions = array();

    private $_renderExceptions = false;

    public function setException(Exception $e)
    {
        $this->_exceptions[] = $e;
    }

    public function getExceptions()
    {
        return $this->_exceptions;
    }

    public function isException()
    {
        return !empty($this->_exceptions);
    }

    public function renderExceptions($flag = null)
    {
        if (null !== $flag) {
            $this->_renderExceptions = $flag ? true : false;
        }
        return $this->_renderExceptions;
    }

    public function sendResponse()
    {
        echo "Header sending...\n";
        $exception = '';
        if ($this->isException() &amp;&amp; $this->renderExceptions()) {
            foreach ($this->getExceptions() as $e) {
                $exception .= $e->getMessage() . "\n";
            }
            echo $exception;
        }
        echo "Body sending...\n";
    }
}
```

主要的概念很簡單，就是 Response 物件先把 Exception 先收集起來，然後再視狀況如何處理，例如：

```php
$response = new Response();
$response->renderExceptions(true); // 讓 Exception 呈現出來

try {
    // 這裡處理我們真正要執行的動作
    throw new Exception('TEST'); // 丟出一個測試用的例外
} catch (Exception $e) {
    $response->setException($e); // 收集例外
}

if ($response->isException()) {
    // 可以在這裡記錄 Exception
}

$response->sendResponse(); // 顯示所有結果 (包含 Header, Exception, Body 等)
```

透過了 Response 物件來管理 Exception ，就可以不必因為 Exception 而中斷我們的程式碼。

## PHP Error 的處理

雖然 Exception 可以用 `try...catch` 控制程式流程，但 PHP Error 卻不行。

因為一般處理 PHP Error 的方法是透過 [set_error_handler](http://www.php.net/manual/en/function.set-error-handler.php)，而當執行完自訂的 Error Handler 後，我們卻只能選擇繼續執行下一行程式碼或將程式中斷離開，不然就是要利用全域變數來設定錯誤旗標以達到控制的目的。

```php
$error = false;

function exceptionErrorHandler($errno, $errstr, $errfile, $errline)
{
    global $error;
    $error = true;
    echo $errstr, "\n";
    return true;
}

set_error_handler("exceptionErrorHandler");
strpos();

if (!$error) {
    echo "Do normal process here.\n";
}
echo "end.\n";
```

不過 PHP5 也幫我們想好了，我們可以在 Error Handler 裡丟出 [ErrorException](http://www.php.net/manual/en/class.errorexception.php) ，就可以配合前面提到的 Response 物件做到更平順的 Exception 處理：

```php
function exceptionErrorHandler($errno, $errstr, $errfile, $errline )
{
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
}

set_error_handler("exceptionErrorHandler");
$response = new Response();
$response->renderExceptions(true); // 讓 Exception 呈現出來

try {
    // 這裡處理我們真正要執行的動作
    trigger_error('TEST', E_USER_ERROR); // 改用 trigger_error 來丟出測試用錯誤
} catch (Exception $e) {
    $response->setException($e); // 收集例外
}

if ($response->isException()) {
    // 可以在這裡記錄 Exception
}
$response->sendResponse(); // 顯示所有結果 (包含 Header, Exception, Body 等)
```

這邊最棒的是 Error Handler 丟出 `ErrorException` 後， `try...catch` 就會發生作用，而不再像 `set_error_handler` 這樣又返回中斷的地方繼續執行，一切就像行雲流水般那麼自然。

## 結論

一個運作良好的系統必須要對錯誤的發生有最大的掌控權，而不是放任它讓系統墜毀在五里霧之中。

雖然前面提到的處理方式也許不是最佳的，但希望透過這樣的介紹，讓大家能夠思考自己的程式應該如何去處理錯誤這件事。

就寫到這裡吧，收工~