---
title: 在 Laravel 中使用 Behat 來加強測試的可讀性 - 基礎篇
tags:
  - 測試
  - Laravel
date: 2018-11-08 18:30:00 +08:00
---


Laravel 的測試框架是基於 PHPUnit 上所建立出來的，而在 Laravel 5.5 之後，測試框架的功能也大幅地加強了。只不過在越來越複雜的專案規格下，我個人覺得 PHPUnit 在情境案例的描述能力上還是不太夠，最好可以用人們看得懂的語言；而目前能夠用自然語言來描述規格情境的，當然就是 [Cucumber](https://cucumber.io/) 的 [Gherkin](http://behat.org/en/latest/user_guide/gherkin.html) 語法了。

<!-- more -->

Cucumber 在 PHP 中的實作，就是 [Behat](http://behat.org) 這個 BDD 框架；雖然我很早就接觸過它了，但實際熟悉它則是在 [91 哥的 TDD 課程](https://skilltree.my/events/skilltree3)之後的自我練習裡。後來我看到 [Laracasts](https://laracasts.com/) 裡 Jeffrey Way 介紹他開發的 [Behat-Laravel-Extension](https://github.com/laracasts/Behat-Laravel-Extension) 可以將 Behat 整合到 Laravel 中，著實讓我開心了一陣子。

不久後我就透過 Behat-Laravel-Extension 在新開發的 API 專案裡整合了 Behat ，也確實體會到了 BDD 的優異之處；而同事也在接手這個專案時，因為透過自然語言所描述的情境，很快地掌握了整個專案的規格。我們就這樣透過 BDD 很快地把一個又一個的 API 生出來，兼顧了開發效率與規格文件。

不過這一兩年來 Behat-Laravel-Extension 已經很久沒人維護了，在我試圖升級專案的 Laravel 版本時，這個套件發生了版本不相容的問題；加上 Behat-Laravel-Extension 相依了許多我其實用不到的 Behat 延伸套件，因此找出一個更精簡的方案就勢在必行了。

## 突破點

要把 Behat 用在 Laravel 的測試上，最大的問題是如何初始化 Application 。事實上 Behat 執行時只是把 `features/*.feature` 檔的 step definitions 和 `FeatureContext` 類別 (`features/bootstrap/FeatureContext.php`) 裡的 method 對應起來後，再跑遍每個 scenario 而已，所以初始化 Application 它並不負責。

不過如果各位有追蹤過 Laravel 專案的 `Illuminate\Foundation\Testing\TestCase` 這個類別的原始碼，你會發現它在 `setUp` 裡已經初始化了 Application ；而既然已經有類別把這件事做好，我是不是就可以直接拿它來用？沒錯！這就是我後來想到的方法。不過試了一陣子，陸陸續續有些問題我無法順利解決，導致這個作法一直被我塵封在腦海裡。

註：其實 Behat-Laravel-Extension 主要也是用來幫忙做初始化 Application 的工作。

就在前陣子我回頭思考這個問題時，想說是不是也有人有想過同樣的作法，結果還真的有！外國 Laravel 開發者 [Matthew Daly](https://matthewdaly.co.uk/) 早在一年多前就想到這個方法了： [Integrating Behat With Laravel](https://matthewdaly.co.uk/blog/2017/02/18/integrating-behat-with-laravel/) 。

以下我們就來實驗一下這個做法。

## 在 Laravel 初始化 Behat 環境

首先我們要建立一個新的 Laravel 專案：

```bash
laravel new Behat-in-Laravel
cd Behat-in-Laravel
```

註：如果想在現有專案上直接來的話，可以省掉這個步驟，不過記得先將程式進版本控制系統。

安裝 Behat ：

```bash
composer require behat/behat --dev
```

接著用以下指令來初始化 Behat 的環境：

```bash
vendor/bin/behat --init
```

這將會建立以下資料夾與檔案：

```bash
+d features - place your *.feature files here
+d features/bootstrap - place your context classes here
+f features/bootstrap/FeatureContext.php - place your definitions, transformations and hooks here
```

到這裡我們只是初始化環境而已，接下來編輯 `features/bootstrap/FeatureContext.php` 這個檔案：

```php
<?php

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;

/**
 * Defines application features from the specific context.
 */
class FeatureContext implements Context
{
    /**
     * Initializes context.
     *
     * Every scenario gets its own context instance.
     * You can also pass arbitrary arguments to the
     * context constructor through behat.yml.
     */
    public function __construct()
    {
    }
}
```

可以看到 `FeatureContext` 類別其實只有實作 `Behat\Behat\Context\Context` 這個介面，所以我們可以對它進行一些改造手術。

首先直接把 `FeatureContext` 類別繼承 Laravel 專案附帶的 `Tests\TestCase` 這個類別，並拿掉 `__construct` 建構子：

```php
<?php

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Tests\TestCase;

/**
 * Defines application features from the specific context.
 */
class FeatureContext extends TestCase implements Context
{
}
```

接下來就是重頭戲了，加上 `before` 及 `after` 兩個 public methods ，然後讓它們分別呼叫 `TestCase` 的 `setUp` 與 `tearDown` 方法：

```php
class FeatureContext extends TestCase implements Context
{
    /**
     * @BeforeScenario
     */
    public function before()
    {
        $this->setUp();
    }

    /**
     * @AfterScenario
     */
    public function after()
    {
        $this->tearDown();
    }
}
```

當然別忘了加上這兩個 hooks ： `@BeforeScenario` 及 `@AfterScenario` 。

之前失敗的原因主要是資料庫相關的環境變數及 migration ，而在前述的文章中 Matthew 是這樣解決的，我們照抄：

```php
    /**
     * @BeforeScenario
     */
    public function before()
    {
        putenv('DB_CONNECTION=sqlite');
        putenv('DB_DATABASE=:memory:');
        $this->setUp();
    }
```

註：文章 Matthew 是在 `__construct` 中做環境變數的初始化與 `setUp` ，理由可能是為了不重複初始化 Application ；但我之後會介紹更巧妙的方法，所以改寫在這邊。

那麼該怎麼做 migration 呢？文章中因為 Laravel 的版本是 `5.4` 的關係，所以是手動呼叫 artisan 指令來處理，不過現在我們有 `RefreshDatabase` 這個 trait 可以用了：

```php
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Defines application features from the specific context.
 */
class FeatureContext extends TestCase implements Context
{
    use RefreshDatabase;
```

加入 `RefreshDatabase` trait 後， migration 相關的動作就會在 `setUp` 方法裡執行；當然所有 Laravel 測試框架提供的 trait 都可以這樣加入， `setUp` 方法都會幫你處理好。

這樣一來 Behat 就可以在 Laravel 測試框架的基礎上執行我們的測試，而不必再透過其他 extension 囉。

## 範例

接下來我直接來個超簡易範例，來確認一下這個做法是否有效。**不過要事先提醒大家，這個範例僅是為了示範 Behat 整合到 Laravel 的開發流程，所以會省略掉 Behat 與 Laravel 的基礎介紹，以及實務開發時該注意的細節。**

假設專案有以下這個需求：

```
提供使用者名稱、 Email 與密碼，並呼叫建立 User 的 API 後，會在資料庫建立一筆使用者的資料。
```

經過規格討論後，我們用 Gherkin 語法建立了 `features/users-api.feature` 這個檔案，並包含了一個情境：

```
#language: zh-TW

功能: User APIs

  場景: 建立使用者
    假定 API 網址為 "/api/users"
    而且 API 附帶資料為
      | name | email            | password |
      | User | user@example.com | example  |
    當 以 "POST" 方法要求 API
    那麼 回傳狀態應為 201
    而且 資料表 "users" 應有資料
      | id | name | email            |
      | 1  | User | user@example.com |
```

先執行一次以下指令：

```bash
vendor/bin/behat --append-snippets
```

它會問我們要把 step definitions 放在哪裡：

```bash
功能: User APIs

  場景: 建立使用者                 # features/users-api.feature:5
    假定 API 網址為 "/api/users"
    而且 API 附帶資料為
      | name | email            | password |
      | User | user@example.com | example  |
    當 以 "POST" 方法要求 API
    那麼 回傳狀態應為 201
    而且 資料表 "users" 應有資料
      | id | name | email            |
      | 1  | User | user@example.com |

1 scenario (1 undefined)
5 steps (5 undefined)
0m0.17s (21.79Mb)

 >> default suite has undefined steps. Please choose the context to generate snippets:

  [0] None
  [1] FeatureContext
```

選 `1` 把所有的 step definitions 都存在 `FeatureContext` 類別裡：

```bash
u features/bootstrap/FeatureContext.php - `API 網址為 "/api/users"` definition added
u features/bootstrap/FeatureContext.php - `API 附帶資料為` definition added
u features/bootstrap/FeatureContext.php - `以 "POST" 方法要求 API` definition added
u features/bootstrap/FeatureContext.php - `回傳狀態應為 201` definition added
u features/bootstrap/FeatureContext.php - `資料表 "users" 應有資料` definition added
```

用編輯器打開 `features/bootstrap/FeatureContext.php` 後，就會看到以下新增的方法：

```php

    /**
     * @Given API 網址為 :arg1
     */
    public function apiWangZhiWei($arg1)
    {
        throw new PendingException();
    }

    /**
     * @Given API 附帶資料為
     */
    public function apiFuDaiZiLiaoWei(TableNode $table)
    {
        throw new PendingException();
    }

    /**
     * @When 以 :arg1 方法要求 API
     */
    public function yiFangFaYaoQiuApi($arg1)
    {
        throw new PendingException();
    }

    /**
     * @Then 回傳狀態應為 :arg1
     */
    public function huiChuanZhuangTaiYingWei($arg1)
    {
        throw new PendingException();
    }

    /**
     * @Then 資料表 :arg1 應有資料
     */
    public function ziLiaoBiaoYingYouZiLiao($arg1, TableNode $table)
    {
        throw new PendingException();
    }
```

雖然 `behat --append-snippets` 所產生的方法在 annonation 會保留原來的中文句子，但卻會把中文的 step definition 轉換成拼音式的方法名稱，因此我們需要將每個方法的名稱換成可讀性高的名稱，同時調整參數名稱：

```php
    /**
     * @Given API 網址為 :apiUrl
     * @param string $apiUrl
     */
    public function apiUrl(string $apiUrl)
    {
        throw new PendingException();
    }

    /**
     * @Given API 附帶資料為
     * @param TableNode $table
     */
    public function apiBody(TableNode $table)
    {
        throw new PendingException();
    }

    /**
     * @When 以 :method 方法要求 API
     * @param string $method
     */
    public function request(string $method)
    {
        throw new PendingException();
    }

    /**
     * @Then 回傳狀態應為 :statusCode
     * @param int $statusCode
     */
    public function assertStatus(int $statusCode)
    {
        throw new PendingException();
    }

    /**
     * @Then 資料表 :tableName 應有資料
     * @param string $tableName
     * @param TableNode $table
     */
    public function assertTableRecordExisted(string $tableName, TableNode $table)
    {
        throw new PendingException();
    }
```

然後再次執行：

```bash
vendor/bin/behat --append-snippets
```

就不會再次詢問是不是要加入 snippets ，而是希望你把 step definitions 的方法實作出來：

```bash
功能: User APIs

  場景: 建立使用者                 # features/users-api.feature:5
    假定 API 網址為 "/api/users" # FeatureContext::apiUrl()
      TODO: write pending definition
    而且 API 附帶資料為            # FeatureContext::apiBody()
      | name | email            | password |
      | User | user@example.com | example  |
    當 以 "POST" 方法要求 API     # FeatureContext::request()
    那麼 回傳狀態應為 201           # FeatureContext::assertStatus()
    而且 資料表 "users" 應有資料     # FeatureContext::assertTableRecordExisted()
      | id | name | email            |
      | 1  | User | user@example.com |

1 scenario (1 pending)
5 steps (1 pending, 4 skipped)
0m0.18s (21.82Mb)
```

接下來把方法實作補上：

```php
    /**
     * @var string
     */
    private $apiUrl = '';

    /**
     * @var array
     */
    private $apiBody = [];

    /**
     * @var \Illuminate\Foundation\Testing\TestResponse
     */
    private $response;

    /**
     * @Given API 網址為 :apiUrl
     * @param string $apiUrl
     */
    public function apiUrl(string $apiUrl)
    {
        $this->apiUrl = $apiUrl;
    }

    /**
     * @Given API 附帶資料為
     * @param TableNode $table
     */
    public function apiBody(TableNode $table)
    {
        $this->apiBody = $table->getHash()[0];
    }

    /**
     * @When 以 :method 方法要求 API
     * @param string $method
     */
    public function request(string $method)
    {
        $this->response = $this->json($method, $this->apiUrl, $this->apiBody);
    }

    /**
     * @Then 回傳狀態應為 :statusCode
     * @param int $statusCode
     */
    public function assertStatus(int $statusCode)
    {
        $this->response->assertStatus($statusCode);
    }

    /**
     * @Then 資料表 :tableName 應有資料
     * @param string $tableName
     * @param TableNode $table
     */
    public function assertTableRecordExisted(string $tableName, TableNode $table)
    {
        $this->assertDatabaseHas($tableName, $table->getHash()[0]);
    }
```

再次執行：

```bash
vendor/bin/behat --append-snippets
```

就會出現：

```bash
功能: User APIs

  場景: 建立使用者                 # features/users-api.feature:5
    假定 API 網址為 "/api/users" # FeatureContext::apiUrl()
    而且 API 附帶資料為            # FeatureContext::apiBody()
      | name | email            | password |
      | User | user@example.com | example  |
    當 以 "POST" 方法要求 API     # FeatureContext::request()
    那麼 回傳狀態應為 201           # FeatureContext::assertStatus()
      Expected status code 201 but received 404.
      Failed asserting that false is true.
    而且 資料表 "users" 應有資料     # FeatureContext::assertTableRecordExisted()
      | id | name | email            |
      | 1  | User | user@example.com |

Failed scenarios:

    features/users-api.feature:5

1 scenario (1 failed)
5 steps (3 passed, 1 failed, 1 skipped)
0m0.19s (22.82Mb)
```

剩下的就是完成 API 程式碼實作啦，這裡就不多做介紹了，完成的程式碼請到 [GitHub](https://github.com/jaceju-tutorial-examples/behat-in-laravel-basic) 上查看。

下一篇我會再介紹稍微進階的做法。