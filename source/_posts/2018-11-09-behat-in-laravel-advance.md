title: 在 Laravel 中使用 Behat 來加強測試的可讀性 - 進階篇
tags:
  - 測試
  - Laravel
date: 2018-11-09 18:38:53
---


在[上一篇文章](https://jaceju.net/2018-11-08-behat-in-laravel/)中，我介紹了如何把 Behat 整合到 Laravel 裡；不過後來我發現在專案規格越來越複雜時，把所有 step definitions 都寫在 `FeatureContext` 類別中變得非常不易閱讀。另一個問題就是我不想要用 `putenv` 函式來定義環境變數，而是希望能有 [Behat-Laravel-Extension](https://github.com/laracasts/Behat-Laravel-Extension) 把環境變數放在 `.env.behat` 裡的用法。

而經過不斷地改良後，我找到了一個目前我很滿意的做法；所以接下來我會延續上一篇的範例來介紹新的做法。

## 改良環境改數的設定方式

為了讓 Behat 執行時可以讀取 `.env.behat` ，我們需要在 Application 初始化時載入新的環境設定檔案。因此我們就不能直接用 Laravel 提供的 `Tests\CreatesApplication` 這個 trait 了，因為它預設會載入 `.env` 檔；這時這也表示我們不再需要直接繼承 `Tests/TestCase` 這個類別，因為它也只是使用了 `Tests\CreatesApplication` 這個 trait 。

取而代之的是我們改為繼承 `Illuminate\Foundation\Testing\TestCase` 這個類別，然後自行覆寫 `createApplication` 這個方法：

```php
<?php

use Behat\Behat\Context\Context;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Testing\TestCase;

class FeatureContext extends TestCase implements Context
{
    // ...

    protected const ENV_FILE = '.env.behat';

    /**
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        $app = require __DIR__ . '/../../bootstrap/app.php';

        $app->loadEnvironmentFrom(self::ENV_FILE);

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
```

可以看到新的 `createApplication` 方法主要是在 `Kernel::bootstrap` 之前，讓 Application 改讀 `.env.behat` 。

接下加入 `.env.behat` ，內容可參考 `phpunit.xml` 裡的 `<php>` 區段設定，例如：

```ini
APP_ENV=testing
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
BROADCAST_DRIVER=log
CACHE_DRIVER=array
SESSION_DRIVER=array
BCRYPT_ROUNDS=4
QUEUE_DRIVER=sync
```

## 分類 Step definitions

當 step definitions 很多時，通通都放在 `FeatureContext` 類別裡就不是個明智的做法了。所以接下來我依照 step definitions 的類型來建立不同的 Context 檔，這樣維護起來也很方便。

首先我們要在專案根目錄下建立一個 `behat.yml` 檔， Behat 在執行時會讀取它裡面的設定：

```yaml
default:
  suites:
    default:
      contexts:
      - ApiFeatureContext
      - DatabaseAssertionContext
```

然後我們執行：

```bash
vendor/bin/behat --init
```

這麼一來 Behat 會幫我們自動產生所有 context 檔案：

```bash
+f features/bootstrap/ApiFeatureContext.php - place your definitions, transformations and hooks here
+f features/bootstrap/DatabaseAssertionContext.php - place your definitions, transformations and hooks here
```

註：雖然這裡只針對範例拆分，但你可以加入其它的 context 檔，後面我會給一些例子。

接著編輯每個 context 檔，先讓它們繼承 `FeatureContext` 類別，並拿掉 `__construct` 建構子；然後再把原來放在 `FeatureContext` 類別裡的 step definitions 搬到對應的 context 類別裡。

API 相關的 step definitions 放在 `ApiFeatureContext` 類別：

```php
<?php

use Behat\Gherkin\Node\TableNode;

class ApiFeatureContext extends FeatureContext
{
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
}
```

資料庫相關的 step definitions 放在 `DatabaseAssertionContext` 類別：

```php
<?php

use Behat\Gherkin\Node\TableNode;

class DatabaseAssertionContext extends FeatureContext
{
    /**
     * @Then 資料表 :tableName 應有資料
     * @param string $tableName
     * @param TableNode $table
     */
    public function assertTableRecordExisted(string $tableName, TableNode $table)
    {
        $this->assertDatabaseHas($tableName, $table->getHash()[0]);
    }
}
```

當然不僅 API 和資料庫可以拆分，例如建立 Model 資料、 Event 或 Queue 相關的 step definitions 可以這樣做。

Model Factory ：

```php
<?php

class ModelFactoryContext extends FeatureContext
{
    /**
     * @Given 存在使用者 :name
     * @param string $name
     */
    public function user(string $name)
    {
        factory(\App\User::class)->create([
            'name' => $name,
        ]);
    }
}
```

Event 相關：

```php
<?php

use App\Events\UserCreated;
use Illuminate\Support\Facades\Event;

class EventAssertionContext extends FeatureContext
{
    /**
     * @BeforeScenario
     */
    public function setUpFake(): void
    {
        Event::fake();
    }

    /**
     * @Then 應發送事件「已新增用戶」
     */
    public function assertDeployStatusCreatedEventDispatched()
    {
        Event::assertDispatched(UserCreated::class, 1);
    }
}
```

其他就請大家自行發揮了。

## 進一步改良

上述的調整有個缺點，就是 `FeatureContext::before` 方法及 `FeatureContext::after` 方法都會初始化 Context 類別時都跑一次，但每個情境在執行時都會再次初始化所有 Context 類別；換句話說每個情境在執行時，有幾個 Context 類別，就會執行幾次 `FeatureContext::before` 方法及 `FeatureContext::after` 方法。這樣一來 `$this->app` 就會被重複初始化，徒然浪費執行時間。

我們希望 `FeatureContext::before` 方法及 `FeatureContext::after` 方法在每個情境執行前後各執行一次就好，可是每個 context 物件實體因為作用域的關係，它們拿到的 `$this->app` 都不會是同一個；這時也需要一個機制來記住已經被初始化的 `$this-app` ，才不用每個 context 都做一次。

綜合上述的想法，最後完整的 `FeatureContext` 類別如下：

```php
<?php

use Behat\Behat\Context\Context;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase;

abstract class FeatureContext extends TestCase implements Context
{
    use RefreshDatabase;

    protected const ENV_FILE = '.env.behat';

    /**
     * @var \Illuminate\Foundation\Application
     */
    protected static $contextSharedApp;

    /**
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        $app = require __DIR__ . '/../../bootstrap/app.php';

        $app->loadEnvironmentFrom(self::ENV_FILE);

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }

    /**
     * @BeforeScenario
     */
    public function before(): void
    {
        if (!static::$contextSharedApp) {
            parent::setUp();
            static::$contextSharedApp = $this->app;
        } else {
            $this->app = static::$contextSharedApp;
        }

    }

    /**
     * @AfterScenario
     */
    public function after(): void
    {
        if (static::$contextSharedApp) {
            parent::tearDown();
            static::$contextSharedApp = null;
        }
    }
}
```

相信上面的程式碼應該很簡單，這邊就不再多做說明了。最後我一樣把範例放在 GitHub 上，請大家自行下載參考。