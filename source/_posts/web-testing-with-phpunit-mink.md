title: 利用 PHPUnit 與 Mink 來做 Web 測試
date: 2015-10-27 18:36:05
tags: ["Web 開發", "Selenium", "測試"]
---

如果你面對的是以前舊有的 PHP 程式，是時候負起一些責任了。

我知道它改起來很痛苦，一堆不良的 PHP 程式習慣都阻礙你的修正；使得每次調整功能時，到底改得對不對，得要等到上線才知道。想要重寫一個新版本，但太多的實作細節你不清楚；也沒有最新的規格文件，讓你無法為新版本做出功能無誤的保證。

現在你唯一擁有的，就是已經在線上運作的程式邏輯；雖然它可能還有 bug ，但至少大多數的功能是通過使用者驗證的。那麼先為它買個保險吧！確保之後的修改不會影響到其他功能的正常運作；而最直接的方式，就是把目前程式邏輯所呈現的結果或是使用者的操作，寫成自動化 Web 測試。

建立 Web 測試的方法有很多，這裡我將介紹我在實務上使用 [PHPUnit](https://phpunit.de/) 加上 [Mink](http://mink.behat.org/en/latest/) 搭配 [PhantomJS](http://phantomjs.org/) 的方法。

<!-- more -->

## 所需工具與原理

在 Web 測試中，主要分成三個部份：

* 自動化測試框架：負責執行測試案例及驗證
* 瀏覽器控制器或模擬器：透過腳本來操作或模擬瀏覽器的行為
* 目標瀏覽器：就是我們常用的網頁瀏覽器

PHPUnit 是 PHP 中最常見的自動化測試框架，要應用在舊專案中也非常輕鬆。

Mink 扮演的就是控制瀏覽器的角色，它可以透過不同的 [Driver](http://mink.behat.org/en/latest/guides/drivers.html) 來控制或模擬瀏覽器。

而 PhantomJS 則是一個透過程式來操作的 Headless WebKit 瀏覽器；也因為它沒有視窗介面，所以啟動速度非常快，非常適合用來測試。另外它還內建 [GhostDriver](GhostDriver) ，讓我們可以透過 [WebDriver Wire Protocol](https://code.google.com/p/selenium/wiki/JsonWireProtocol)  來操作它。

所以整個 Web 測試的基礎，就是在 PHPUnit 的測試案例中，透過 Mink 的 Selenium2 Driver 來操作 PhamtomJS 。

接下來就進入實作吧。

## 工具的安裝

以下介紹的安裝方式，都是在 Mac OS X 環境下完成；其他作業系統的安裝方式也差不多，這裡就不再贅述。

### 安裝 PHPUnit 與 Mink

先建立一個專案目錄，然後切換到專案目錄下，執行：

```bash
composer require phpunit/phpunit behat/mink-selenium2-driver
```

這樣 Composer 會將 PHPUnit 、 Mink 及 Mink Selenium 2 Driver 安裝在 `vendor` 目錄下，並自動建立 `composer.json` 及 `composer.lock` 兩個檔案。

註：這裡我假設你的環境可以執行 `composer` 指令，所以也不再贅述 Composer 的安裝流程。

### 安裝 PhantomJS

接著到 [PhantomJS 官網](http://phantomjs.org/download.html)下載 Mac OS X 專用的 ZIP 檔。然後執行：

```
unzip phantomjs-2.0.0-macosx.zip
sudo mv phantomjs /usr/local/bin/
```

用以下指令確認有安裝完成：

```bash
phantomjs --version
```

沒問題的話，應該會出現 `2.0.0` 。

## 設定專案的 PHPUnit

在專案目錄下新增 `phpunit.xml` 檔，內容為：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit backupGlobals="false"
         backupStaticAttributes="false"
         bootstrap="vendor/autoload.php"
         colors="true"
         convertErrorsToExceptions="true"
         convertNoticesToExceptions="true"
         convertWarningsToExceptions="true"
         processIsolation="false"
         stopOnFailure="false"
         syntaxCheck="false">
    <testsuites>
        <testsuite name="Application Test Suite">
            <directory>./tests/</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

執行 `./vendor/bin/phpunit` ，確認有使用這個設定檔：

```
PHPUnit 5.0.8 by Sebastian Bergmann and contributors.

Time: 13 ms, Memory: 1.75Mb

No tests executed!
```

## 測試實例

簡單介紹撰寫測試案例的步驟：

1. 建立一個 driver 物件，這裡是使用 `Selenium2Driver` 。
2. 建立一個 session 物件，並透過上面的 driver 物件來操作瀏覽器。
3. 將 session 物件連上指定網址。
4. 從 session 取出 page 物件來操作頁面。
5. 取出 page 物件的狀態或內容來驗證。

詳細的測試寫法可以參考 [Mink 官方文件](http://mink.behat.org/en/latest/index.html)。

以下我示範如何用 Google 來搜尋關鍵字，並驗證搜尋結果有包含我所預期的文字。

先建立 `tests` 目錄，然後新增一個 `tests/GoogleSearchTest.php` 檔，內容如下：

```php
<?php
use Behat\Mink\Driver\Selenium2Driver;
use Behat\Mink\Session;

class GoogleSearchTest extends PHPUnit_Framework_TestCase
{
    public function testSearchWithKeyword()
    {
        // 使用 Selenium2Driver 來操作 PhantomJS
        $driver = new Selenium2Driver('phantomjs');

        // 建立一個 Session 物件來控制瀏覧器
        $session = new Session($driver);
        $session->start();

        // 瀏覽 Google 首頁
        $session->visit('https://www.google.com');

        // 操作頁面物件來搜尋關鍵字
        $page = $session->getPage();
        $page->fillField('q', 'Jace Ju');
        $page->find('css', 'form')->submit();

        // 得到搜尋結果後驗證是否包含預期中的文字
        $text = $page->getText();
        $this->assertContains('網站製作學習誌', $text);
    }
}
```

## 執行測試

在執行測試之前，需要先啟動 PhantomJS 。 PhantomJS 提供一個 `--webdriver` 的選項讓它可以啟用遠端 WebDriver 模式，接收測試程式透過 WebDriver API 傳來的要求。另外因為有時測試的網址會包含 SSL ，所以要用 `--ssl-protocol=tlsv1` 及 `--ignore-ssl-errors=true` 來確保 SSL 的操作正常。

```bash
phantomjs --webdriver=4444 --ssl-protocol=tlsv1 --ignore-ssl-errors=true
```

PhantomJS 順利啟動後，就可以另開一個 terminal 視窗來進行測試了：

```bash
./vendor/bin/phpunit
```

測試無誤的話會出現以下結果：

```
PHPUnit 5.0.8 by Sebastian Bergmann and contributors.

.                                                                   1 / 1 (100%)

Time: 2.38 seconds, Memory: 4.50Mb

OK (1 test, 1 assertion)
```

## Page Objects 模式

上面的例子中有個問題：當頁面功能沒有更動，但是 UI 改變時 (例如 DOM 元素或 id/class 名稱) ，我們就必須去更改測試案例的程式碼；而如果同樣的功能在多個測試案例中出現，那麼要改的地方就更多了。所以在實務中，我們會將頁面的功能行為與 UI 細節分離開來，以解決 UI 細節重複的問題；為了這個目標，我們引入 [Page Objects](https://code.google.com/p/selenium/wiki/PageObjects) 這個模式。

要特別注意的是， Page Objects 模式和 Mink 的 page 物件是兩件事。 Page Objects 模式主要是透過 API 描述頁面的行為，並封裝 UI 細節；而 Mink 的 page 物件則實際上是一個 `DocumentElement` 物件，主要是用來操作頁面上的元素。換句話說，在 Page Objects 模式中，頁面類別所封裝的 UI 細節，就是用 `DocumentElement` 物件來操作的。

### 實作 Page Objects 模式

首先在 `composer.json` 中加入：

```json
    "autoload": {
        "psr-4": {
            "PageObject\\": "tests/PageObject/"
        }
    }
```

接著建立 `tests/PageObject` 目錄，並執行 `composer dump` 。

新增 `tests/PageObject/Page.php` 這個抽象類例，主要是封裝 Mink 的 Session 物件及 Page 物件，並讓後面繼承的頁面類別可以復用：

```php
<?php
namespace PageObject;

use Behat\Mink\Session;

abstract class Page
{
    /**
     * @var Session
     */
    protected $session;

    /**
     * @var string
     */
    protected $url = 'http://localhost/';

    /**
     * @param Session $session
     * @param string $url
     */
    public function __construct(Session $session, $url = '')
    {
        $this->session = $session;
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            $this->url = $url;
        }
        $this->session->visit($this->url);
    }

    /**
     * @param $name
     * @return Page
     */
    public function loadPage($name)
    {
        $className = 'PageObject\\' . $name;
        if (class_exists($className)) {
            return new $className($this->session);
        }
        return null;
    }
}
```

### 將頁面細節封裝在頁面行為功能裡

接下來先建立 `tests/PageObject/GoogleHome.php` 檔；這是 Google 首頁類別，它繼承抽象的 `Page` 類別，並提供一個 `search` 方法：

```php
<?php
namespace PageObject;

class GoogleHome extends Page
{
    protected $url = 'https://www.google.com';

    /**
     * @param $keyword
     * @return GoogleSearchResult
     * @throws \Behat\Mink\Exception\ElementNotFoundException
     */
    public function search($keyword)
    {
        $page = $this->session->getPage();
        $page->fillField('q', $keyword);
        $page->find('css', 'form')->submit();

        return $this->loadPage('GoogleSearchResult');
    }
}
```

這裡，我把原來輸入關鍵字並送出表單的 UI 操作，封裝在 `search` 方法中，並回傳一個搜尋結果頁面物件。

再建立 `tests/PageObject/GoogleSearchResult.php` 檔，它主要是封裝搜尋結果頁。

```php
<?php
namespace PageObject;

use PHPUnit_Framework_Assert as Assert;

class GoogleSearchResult extends Page
{
    /**
     * @param $text
     */
    public function shouldContains($text)
    {
        $page = $this->session->getPage();
        $result = $page->getText();
        Assert::assertContains($text, $result);
    }
}
```

我在 `GoogleSearchResult` 類別的 `shouldContains` 方法中加入斷言 (assertion) ，這是為了讓外部的測試案例可以用更語意化的方式來使用這個類別，是一種 `Tell Don't Ask` 的實現。

最後就可以把原來的測試案例改用新的頁面類別來重寫了：

```php
<?php
use Behat\Mink\Driver\Selenium2Driver;
use Behat\Mink\Session;
use PageObject\GoogleHome;

class GoogleSearchTest extends PHPUnit_Framework_TestCase
{
    public function testSearchWithKeyword()
    {
        // 使用 PhantomJS 當做 Driver
        $driver = new Selenium2Driver('phantomjs');

        // 建立一個 Session 物件來控制瀏覧器
        $session = new Session($driver);
        $session->start();

        // 瀏覽 Google 首頁
        $homePage = new GoogleHome($session);

        // 搜尋關鍵字並驗證搜尋結果是否包含預期的文字
        $homePage->search('Jace Ju')
            ->shouldContains('網站製作學習誌');
    }
}
```

這麼一來，在測試案例中就可以清楚地用頁面物件的行為去描述實際的需求，而不是落在操作 UI 的思維裡。

## 總結

雖然舊專案可能難以做到單元測試，但我們可以先利用 Web 測試來驗證它已經存在的行為；而在 Web 測試中可以透過程式來控制瀏覽器，達到自動化測試的目的。在撰寫測試案例時，最重要的是對需求的描述，而不是 UI 操作的細節；因此可以用 Page Objects 模式來封裝 UI 細節，讓頁面物件提供有語意化的行為操作方式。

希望這個介紹能幫助大家對 Web 測試有基本的瞭解，當然在實務上可能會遇到的問題會更複雜；有機會的話我會另文分享自己在實務上遇到的問題，也歡迎大家提供不同的見解。