---
title: "開發 Laravel 套件時的單元測試"
date: 2013-12-12 22:51:00 +08:00
tags: [Laravel, "測試"]
---

在官方手上的[有關開發 Laravel 4 套件的章節](http://laravel.com/docs/packages)，內容其實寫得滿詳盡了。只是它缺少了有關單元測試的說明，以下我將介紹一些自己的做法和經驗。

<!-- more -->

## 前置作業

我們可以用以下指令來建立一個新的 Laravel 套件：

```bash
php artisan workbench --resource vendor/name
```

然後在專案目錄下的 `workbench/vendor/name` 路徑下找到我們的專案原始檔。

註： `vendor` 可以是公司名稱或開發者的名字，而 `name` 則是套件名稱。這裡雖然直接以這個名稱當範例，但實務上請不要這麼設定。

我們會看到目錄結構如下：

```
.
├── composer.json
├── phpunit.xml
├── public
├── src
│   ├── Vendor
│   │   └── Name
│   │       └── NameServiceProvider.php
│   ├── config
│   ├── controllers
│   ├── lang
│   ├── migrations
│   └── views
└── tests
```

接下來不特別說明的話，所有操作都是在上述的路徑裡。

## Composer 設定

我們假設套件會用到資料庫，所以第一步是把 `illuminate/database` 這個套件加進 `composer.json` 的 `require` 區段設定內：

```
"require": {
    ...
    "illuminate/database": "4.0.x"
}
```

接著是 PHPUnit ，要將它寫在 `require-dev` 區段設定中：

```
"require-dev": {
    ...
    "phpunit/phpunit": ">=3.7.0"
}
```

然後執行 `composer update --prefer-dist` ，以安裝資料庫套件。

## Model 類別基本結構

這邊假設我們的 model 名稱為 `Ranger` ，它只有 `id` 和 `name` 兩個屬性。請在 `src/Vendor/Name` 這個路徑下建立一個 `Ranger.php` ，然後輸入以下內容：

```php
namespace Vendor\Name;

use Illuminate\Database\Eloquent\Model as Eloquent;
use Illuminate\Database\Schema\Blueprint as Table;

class Ranger extends Eloquent
{
    public static $tableName = 'rangers'; // 自行加入的屬性

    protected $guarded = array(); // 視需求更改

    /**
     * @return callable
     */
    public static function getBlueprint() // 自行加入的方法
    {
        return function (Table $table) {
            $table->increments('id');
            $table->string('name', 100);
        };
    }
}
```

Laravel 的 Model 預設會自行找出類別名稱與資料表名稱的對應，然後將它設定在 `$table` 這個屬性中；不過為了稍後在做 migration 和單元測試時的需求，我自行加了一個 static 變數： `$tableName` 。

另一個 static 方法 `getBlueprint` 是回傳一個 `callback` 給 Schema Builder 使用，在後面我們會在製作 migration 與單元測試時會用到。

## 單元測試

基本上單元測試的設定檔， Laravel 已經幫我們產生好了。我們只需要建立 model 對應的測試即可。

在 `tests` 目錄下再建立一個子資料夾 `NameTest` ，其中 `Name` 就是對應到我們的套件名稱。

然後在 `composer.json` 的 `psr-0` 區段中加入：

```json
"psr-0": {
    ...
    "Vendor\\NameTest": "tests/"
}
```

這會讓 composer 的自動載入找到我們的測試類別。

接著在 `NameTest` 資料夾中再建立一個 PHP 檔案 `RangerTest.php` ，內容如下：

```php
namespace Vendor\NameTest;

use Vendor\Name\Ranger;
use Illuminate\Database\Capsule\Manager as DB;

class RangerTest extends \PHPUnit_Framework_TestCase
{

}
```

這邊比較關鍵的部份的是把 `Illuminate\Database\Capsule\Manager` 載入後，取別名為 `DB` 方便後續操作。

另外因為套件並沒辦法使用到 Laravel 在 application 中的 Facade 機制，所以直接用 `\PHPUnit_Framework_TestCase` 類別，而不是 Laravel 內建的 `TestCase` 類別。

## 資料庫與資料表設定

在測試中，通常較為麻煩的是測試 Model 與資料庫之間的溝通。其實我們可以直接提供一個測試用的資料庫讓測試使用。

測試用的資料庫可以是 Laravel 所支援的任一類型關連式資料庫，這裡我們選用 sqlite 。

接著在 `RangerTest` 類別中加入以下程式碼：

```php
...

    protected static $db = null;

    public static function setUpBeforeClass()
    {
        static::connectTestDb();
        static::initTables();
    }

    protected static function connectTestDb()
    {
        static::$db = new DB();
        static::$db->addConnection(array(
            'driver'    => 'sqlite',
            'database'  => ':memory:',
            'prefix'    => '',
        ));
        static::$db->setAsGlobal();
        static::$db->bootEloquent();
    }

    protected static function initTables()
    {
        $conn = static::$db->getConnection();
        $builder = $conn->getSchemaBuilder();

        $builder->dropIfExists(Ranger::$tableName);
        $builder->create(Ranger::$tableName, Ranger::getBlueprint());
    }

```

在 PHPUnit 中提供了 `setUpBeforeClass` 這個方法，主要是在所有測試開始前要先做的動作；我們利用它來初始化資料庫連線及產生我們需要資料表。

註： `setUp` 是在每個 test case 啟動前做。

`connectTestDb` 方法是對資料庫連線，讓接下來的 Model 可以直接操作，而不需要處理連線問題。這裡我們可以直接使用 sqlite 配合 `:memory:` 來使用記憶體當做測試資料庫，或是在 MySQL 或其他與正式機相同規格的資料庫伺服器上建立測試用的資料庫。

`initTables` 用來建立資料表，由於我們在 model 的 `getBlueprint` 中會回傳 Schema 的資訊，所以就直接利用它來建資料表。

## 開始測試

現在我們可以撰寫測試案例了，舉例如下：

```php
...

    public function testFind()
    {
        DB::table('rangers')->insert(array(
            'name' => 'Jace Ju',
        ));
        $ranger = Ranger::find(1);
        $this->assertEquals('Jace Ju', $ranger->name);
    }
```

接著開啟終端機，切換到 `workbench/vendor/name` 目錄下，執行：

    phpunit

就可以看到測試結果了。

## 多個測試類別共用同一資料連線

目前我們是在 `RangerTest` 類別中連結資料庫，但通常我們會有很多 Model 需要被測試，所以需要共用上述的資料庫連結的部份。

先建立一個 `TestCase` 類別，它與 `RangerTest` 放在同一個目錄下。

再將先前的資料庫連結的部份複製到新的 `TestCase` 類別裡，成果如下：

```php
namespace Vendor\NameTest;

use Illuminate\Database\Capsule\Manager as DB;

class TestCase extends \PHPUnit_Framework_TestCase
{
    protected static $db = null;

    public static function setUpBeforeClass()
    {
        static::connectTestDb();
        static::initTables();
    }

    protected static function connectTestDb()
    {
        // ... 同上
    }

    protected static function initTables()
    {
        // ... 同上
    }
}
```

在 `initTables` 方法中，可以初始化所有會用到的資料表。

然後回到 `RangerTest` 類別，將連結資料庫的部份移除，並改為繼承 `TestCase` ：

```php
namespace Vendor\NameTest;

use Illuminate\Database\Capsule\Manager as DB;

class RangerTest extends TestCase
{
    // ...
}
```

這時候如果執行 `phpunit` 的話，會發現找不到 `TestCase` 這個類別。

解決方法是在 `composer.json` 裡面告訴 composer 要去哪裡找這個類別檔案：

```json
    "classmap": [
        "tests/NameTest/TestCase.php"
    ],
```

這麼一來， Model 與資料庫的測試就容易許多了。

## Migration

雖然我們可以測試 model 了，但實際作業還是需要把資料表建立在正式資料庫上。這裡就要透過 Laravel 的 migration 機制。

這裡就簡單說明一下剛剛在 `Ranger` 類別建立的 callback 如何使用：

首先要為 workbench 中 package 建立 migrations 資料夾：

```bash
mkdir workbench/vendor/name/src/migrations
```

然後我們要為 package 建立一個 migration ：

```bash
php artisan migrate:make create_rangers_table --bench=vendor/name
```

這會建立 `workbench/vendor/name/src/migrations/xxxx_xx_xx_xxxxxx_create_rangers_table.php` 這個檔案 (xx 會視建立時間而有所不同) ，其類別名稱為 `CreateRangersTable` 。

在 `CreateRangersTable` 中，我們可以直接利用先前在 `Ranger` 類別中定義的 `$tableName` 與 `getBlueprint` 來完成 migration 的 `up` 及 `down` ：

```php
use Illuminate\Database\Migrations\Migration;
use Vendor\Name\Ranger;

class CreateRangersTable extends Migration
{
    public function up()
    {
        Schema::create(Ranger::$tableName, Ranger::getBlueprint());
    }

    public function down()
    {
        Schema::drop(Ranger::$tableName);
    }
}
```

這麼一來就不需要重複定義 schema 的程式碼了。

## 總結

最後歸納幾個重點：

1. 將 Schema Builder 需要的 callback 放在 Model 中，讓測試與 migration 可以共用同一個 schema 。

2. 利用 sqlite 的 `:memory:` 來做為測試資料庫是非常方便的。

3. 將資料庫連結的程式碼移到共用類別中。

4. 利用在 model 定義的 `$tableName` 與 `getBlueprint` 來完成 table migration 。

歡迎指正或提供更好的建議。