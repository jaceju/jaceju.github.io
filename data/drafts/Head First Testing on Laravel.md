# Head First Testing on Laravel 5

測試的理論有很多資訊可以參考，大家也可以說得頭頭是道；但直到我在上完 Joey Chen​ 的課，並親自將它實行到專案中之後，我才發現自己對於「測試」的理解有多麼不足。

## 目標

如何在開發的過程中加入測試。

1. Model
1. Repository
1. Controller
1. Auth

## 範例

建立一個需要登入的文章發表系統。

1. 使用者登入登出
1. 文章列表、新增文章

雖然簡單，但足夠我們對 Laravel 5 有基本的理解了。

更完整的專案實作，可以參考 Laracasts 上的 [Laravel 5 Fundamentals](https://laracasts.com/series/laravel-5-fundamentals/) 一系列影片。

## 安裝 Laravel 並建立相關檔案與環境

```bash
$ composer create-project laravel/laravel demo
$ cd demo
```

安裝 Mockery ：

```bash
$ composer require mockery/mockery --dev
```

## 針對 model 資料存取做測試

測試資料庫存取時，要儘可能不動到正式資料庫，而且要能快速建立

也儘可能把設定都放在測試可控制的環境，不要跟主程式有牽扯。

* 定義測試用資料庫
* 使用 sqlite `:memory:` 來測試

建立 Article model ：

```bash
$ php artisan make:model Article -m
```

這將會：

* 建立 `app/Article.php`
* 建立 `database/migrations/xxxx_xx_xx_xxxxxx_create_articles_table.php`

在 `Article.php` 加入以下屬性：

```php
namespace App;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{

    // 定義當使用 __construct($data) 或 create($data) 時
    // 可以被修改的欄位，進而保護其他欄位不被修改
    protected $fillable = ['title', 'body'];

}
```

修改 `database/migrations/xxxx_xx_xx_xxxxxx_create_articles_table.php` ，在 `up` 方法加入 `title` 、 `body` 兩個欄位：

```php
    public function up()
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->text('body');
            $table->timestamps();
        });
    }
```

設定資料庫連線，修改 `tests/TestCase.php` ，加入：

```php
    public function setUp()
    {
        parent::setUp();
        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite' => [
                'driver'    => 'sqlite',
                'database'  => ':memory:',
                'prefix'    => '',
            ],
        ]);
    }
```

註：另一種方法是修改 `config/database.php` 及 `phpunit.xml` ，但上面的方法比較簡單。

新增 `tests/ArticleTest.php` ，並加入 Laravel 5.1 提供的 `DatabaseMigrations` trait ：

```php
use Illuminate\Foundation\Testing\DatabaseMigrations;

class ArticleTest extends TestCase
{
    // 自動執行 migration
    use DatabaseMigrations;
}
```

先測試沒有文章：

```php
// ...
use Illuminate\Database\Eloquent\Collection;

class ArticleTest extends TestCase
{
    // ...

    // 測試如果文章為空
    public function testEmptyResult()
    {
        // 取得所有文章
        $articles = Article::all();

        // 確認 $articles 是 Collection
        $this->assertInstanceOf(Collection::class, $articles);

        // 而文章數為 0
        $this->assertEquals(0, count($articles));
    }
}
```

然後編輯 `database/factories/ModelFactory.php` ，加入：

```php
$factory->define(App\Article::class, function (Faker\Generator $faker) {
    return [
        'title' => $faker->sentence,
        'body' => $faker->text,
    ];
});
```

測試新增資料並列出：

```php
class ArticleTest extends TestCase
{
    // ...

    // 測試新增資料並列出
    public function testCreateAndList()
    {
        // 新增 10 筆資料
        factory(App\Article::class, 10)->create();

        // 確認有 10 筆資料
        $articles = Article::all();
        $this->assertEquals(10, count($articles));
    }
}
```

執行測試：

```bash
$ ./vendor/bin/phpunit
```

* 使用 globally installed 的 phpunit 會有 error
* https://github.com/laravel/framework/issues/7299

因為 ORM 已經幫我們實作 Model 存取資料的相關機制，我們只是先測試驗證它沒有問題；所以實際上不需要特別測試 Model ，這裡只是為了確認測試是可以正確運作的。

好的 Pattern 是用 Repository 把 Model 封裝起來。

## 用 Repository 包裝 Model

* 不讓 Controller 直接接觸 Model
* 避免 Controller 肥大
* 封裝資料存取邏輯
* 抽換資料庫實作較容易

### 建立測試目標與測試類別

建立 `app/Repositories/ArticleRepository.php` ：

```php
namespace App\Repositories;

use App\Article;

class ArticleRepository
{
}
```

這就是我們要測試的目標。

再建立 `tests/ArticleRepositoryTest.php` 測試類別：

```php
use App\Article;
use App\Repositories\ArticleRepository;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class ArticleRepositoryTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * @var ArticleRepository
     */
    protected $repository = null;

    public function setUp()
    {
        parent::setUp();
        $this->repository = new ArticleRepository();
    }
}
```

### 測試 `latest10` 方法：

```php
use Illuminate\Database\Eloquent\Collection;

// ...

    public function testFetchLatest10Articles()
    {
        // 新增 100 筆資料，並取最後 10 筆
        /** @var Collection $expected */
        $expected = factory(Article::class, 100)->create()
            ->take(-10)
            ->sortByDesc('id');

        // 從 repository 中取得最新 10 筆文章
        /** @var Collection $articles */
        $articles = $this->repository->latest10();
        $this->assertEquals(10, count($articles));

        // 比對兩個 collection 中的 title 是否相符
        $this->assertEquals(
            $expected->pluck('title')->all(),
            $articles->pluck('title')->all()
        );
    }
```

執行測試出現 `Fatal error` ，因為我們還沒有 `latest10` 方法。

在 `app/Repositories/ArticleRepository.php` 加入：

```php
    public function latest10()
    {
    }
```

執行測試後紅燈，但錯誤訊息不同了，這是正常的第一步，我們還需要加入實作：

```php
    public function latest10()
    {
        return Article::query()
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();
    }
```

測試出現綠燈，成功。

這就是 TDD 的流程，也就是「寫測試 → 紅燈 → 寫程式 → 綠燈」。

接下來都會照這個步調來進行。

### 測試 `create` 方法：

```php
class ArticleRepositoryTest extends TestCase
{
    // ...

    public function testCreateArticle()
    {
        // 因為前面有 100 筆了，
        // 所以這裡我們可以預測新增後的 id 是 101
        $latestId = self::POST_COUNT + 1;

        $article = $this->repositorys->create([
            'title' => 'title ' . $latestId,
            'body'  => 'body ' . $latestId,
        ]);

        $this->assertEquals(self::POST_COUNT + 1, $article->id);
    }
}
```

測試失敗，新增 `ArticleRepository::create` 方法：

```php
    public function create(array $attributes)
    {
        return Article::create($attributes);
    }
```

測試成功。

## 改用 Ioc Container

* 不直接使用 `new`
* 讓 IoC Container 幫我們注入必要實體

### 改寫測試

修改 `ArticleRepositoryTest::setUp` ，用 `$this->app->make` 來建立 `ArticleRepository` 的實體：

```php
    public function setUp()
    {
        parent::setUp();
        $this->repository = $this->app->make(ArticleRepository::class);
    }
```

### 改寫 Repository 類別

為 `ArticleRepository` 類別加入 `$article` 屬性，並在建構子注入：

```php
class ArticleRepository
{
    /**
     * @var Article
     */
    private $article;

    public function __construct(Article $article)
    {
        $this->article = $article;
    }

    // ...
}    
```

將 `latest10` 與 `create` 方法中的 `Article::` 改成 `$this->article->` ：

```php
    public function latest10()
    {
        return $this->article->query()
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();
    }

    public function create(array $attributes)
    {
        return $this->article->create($attributes);
    }
```

執行測試。    

## 設定資料庫與建立資料表

* 測試通過後，也許會想實際執行看看是否真的有寫入資料庫。
* 前面建立 model 時，已經建立好相關的 migration 檔案。
* 設定在實際環境運作的資料庫設定。

如果使用 MySQL 的話，修改 `.env` 檔。因為這邊為示範用，故採用 sqlite 。

修改 `config/database.php` 的 `default` 設定：

```php
    'default' => 'sqlite',
```

建立 sqlite 資料庫：

```bash
$ touch storage/database.sqlite
```

安裝資料表：

```bash
$ php artisan migrate
```

用 `php artisan tinker` 驗證：

```
>>> $rep = new App\ArticleRepository();
>>> $rep->latest10()->toArray();
>>> $rep->create([
    'title' => 'test',
    'body' => 'test',
])
>>> $rep->latest10()->toArray();
```

* tinker 已經初始化好相關 Laravel 執行時期的 autoload 機制。

## 建立 Controller

建立 Controller 與 View ：

```bash
$ php artisan make:controller ArticleController --plain
$ mkdir -p resources/views/articles
$ touch resources/views/articles/index.blade.php
```

如果不加 `--plain` ，會預設加入 `index` 、 `create` 、 `store` ... 等操作 resource 的相關方法。

在 `ArticleController.php` 中加入：

```php
    public function index()
    {
        $articles = [];
        return view('articles.index', compact('articles');
    }
```

編輯 `app/Http/routes.php` ，將已定義的 routes 暫時註解掉，再加入：

```php
Route::resource('articles', 'ArticleController');
```

用 `php artisan route:list` 確認有沒有正確加入。

## 建立 Controller 測試

* 測試流程邏輯
* 測試 HTTP 狀態

把原來的 `tests/ExampleTest.php` 改名：

```bash
$ mv tests/ExampleTest.php tests/ArticleControllerTest.php
```

編輯 `tests/ArticleControllerTest.php` ：

```php
class ArticleControllerTest extends TestCase {

    public function testArticleList()
    {
        // 用 GET 方法瀏覽網址 /post
        $this->call('GET', '/posts');

        // 改用 Laravel 內建方法
        // 實際就是測試是否為 HTTP 200
        $this->assertResponseOk();

        // 應取得 articles 變數
        $this->assertViewHas('articles');
    }

}
```

測試成功。

* 透過 `call` 方法執行 route，進而建立 Controller 實體來測試。
* Laravel 有內建一些測試 response 狀態的 assert 方法。
* session 或 cache 直接使用 array

## 注入 Repository 到 Controller 中

文章實際會從 `ArticleRepository` 裡取得，所以 Controller 會需要注入 Repository 。

```php
namespace App\Http\Controllers;

use App\Repositories\ArticleRepository;
use Illuminate\Http\Response;

class ArticleController extends Controller {

    protected $repository;

    // 利用 Service Container (DI) 來自動注入 ArticleRepository
    public function __construct(ArticleRepository $repository)
    {
        $this->repository = $repository;
    }

    // ...
}
```

修改 `ArticleController::index` ：

```php
    public function index()
    {
        // 改成從 ArticleRepository 中取得資料
        $articles = $this->repository->latest10();

        return view('article.index', compact('articles'));
    }
```

測試不成功，因為我們沒有連接資料庫。

## 用 Mockery 隔離 ArticleRepository

* 不讓 Controller 測試接觸資料庫或其他需要 IO 的媒介
* 利用 Mockery 透過 `ArticleRepository` 生成假物件 (mock object)
* 利用 Service Container 注入假物件取代原本應該被呼叫的物件
* 讓假物件的方法回傳假值

```php
class ArticleControllerTest extends TestCase {

    protected $repositoryMock = null;

    public function setUp()
    {
        parent::setUp();

        // Mockery::mock 可以利用 Reflection 機制幫我們建立假物件
        $this->repositoryMock = Mockery::mock('App\Repositories\ArticleRepository');

        // Service Container 的 instance 方法可以讓我們
        // 用假物件取代原來的 ArticleRepository 物件
        $this->app->instance('App\Repositories\ArticleRepository', $this->repositoryMock);
    }

    public function tearDown()
    {
        // 每次完成 test case 後，要清除掉被 mock 的假物件
        Mockery::close();
    }

    public function testArticleList()
    {
        // 確認程式會呼叫一次 ArticleRepository::latest10 方法
        // 實際上是為這個 mock object 加入 latest10 方法
        // 沒有呼叫到的話就會發出異常
        // 再假設它會回傳 foo 這個字串
        // 這樣就不需要真的去連結資料庫
        $this->repositoryMock
            ->shouldReceive('latest10')
            ->once()
            ->andReturn([]);

        $this->call('GET', '/');
        $this->assertResponseOk();

        // 應取得 articles 變數
        // 而其值為空陣列
        $this->assertViewHas('articles', []);
    }
}
```

## 新增資料的測試

* 程式中會透過 Repository 來新增資料，所以也要 mock 新增方法。
* 因為有用到 POST 方法，所以要考慮 CSRF
* 新增完成後要導向列表頁

先確認 CSRF 的保護機制是有作用的：

```php
    public function testCsrfFailed()
    {
        // 模擬沒有 token 時
        // 程式應該是輸出 500 Error
        $this->call('POST', 'articles');
        $this->assertResponseStatus(500);
    }
```

加入 `ArticleControllerTest::testCreateArticleSuccess` ：

```php
use Illuminate\Support\Facades\Session;

class ArticleControllerTest extends TestCase {

    // ...

    // 測試新增資料成功時的行為
    public function testCreateArticleSuccess()
    {
        // 會呼叫到 ArticleRepository::create
        $this->repositoryMock
            ->shouldReceive('create')
            ->once();

        // 初始化 Session ，因為需要避免 CSRF 的 token
        Session::start();

        // 模擬送出表單
        $this->call('POST', 'articles', [
            'title' => 'title 999',
            'body' => 'body 999',
            '_token' => csrf_token(), // 手動加入 _token
        ]);

        // 完成後會導向列表頁
        $this->assertRedirectedToRoute('articles.index');
    }
```

完成新增功能，也就是 `store` 方法。而 `store` 方法也會透過 Service Container 來注入 HTTP Request 物件。

```php
use Illuminate\Http\Request;

class ArticleController extends Controller {

    // ...

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request)
    {
        // 直接從 Http\Request 取得輸入資料
        $this->repository->create($request->all());

        // 導向列表頁
        return Redirect::route('articles.index');
    }
```

## 加入表單

剛開始學習較複雜的測試時，即便通過測試，但實際頁面的實作也還是必要的。

* 真正加入表單頁面。
* Laravel 5 把 HTML 和 Form 元件拿掉了，要自己加回來。

加入 `illuminate/http` 套件。

```bash
$ composer require illuminate/html
```

在 `config/app.php` 加入：

```php
    'providers' => [

        // ...

        // 加入此行，載入 illuminate/html 的 Service Provider
        'Illuminate\Html\HtmlServiceProvider',

        /*
         * Application Service Providers...
         */
        // ...
    ],

    // ...

    'aliases' => [
        // ...

        // 加入以下兩行，使用 Form 的 facade 介面
        'Form'      => 'Illuminate\Html\FormFacade',
        'HTML'      => 'Illuminate\Html\HtmlFacade',

    ],
```

建立表單，即 `resources/views/articles/create.php` ：

* `{!! !!}` 輸出 raw data
* `Form::open` 會自動加入 `_token` 的隱藏欄位
* `$error` 是一個 `ViewErrorBag` 物件，用來放置 Session 保留的錯誤訊息

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Create Article</title>
</head>
<body>

{!! Form::open(['route' => 'articles.index']) !!}
<p>
    Title: {!! Form::text('title') !!}
</p>
<p>
    Body: {!! Form::textarea('body') !!}
</p>
<p>
    {!! Form::submit('Create Article') !!}
</p>
{!! Form::close() !!}

@if ($errors->any())
<ul>
    @foreach ($errors->all() as $error)
    <li>{{ $error }}</li>
    @endforeach
</ul>
@endif

</body>
</html>
```

`ArticleController` 加入 `create` 方法：

```php
    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        return view('articles.create');
    }
```

實際用瀏覽器測試以下網址：

```
http://localhost/posts/create
```

## 驗證測試

* 利用 Laravel 5 新增的 FormRequest 來做驗證
* 驗證錯誤訊息與是否有正確保留舊輸入
* 是否有導回前一頁 (表單頁)

模擬沒有填值即送出表單：

```php
    public function testCreateArticleFails()
    {
        Session::start();

        $this->call('POST', 'articles', [
            '_token' => csrf_token(),
        ]);

        $this->assertHasOldInput();
        $this->assertSessionHasErrors();

        // 應該會導回前一個 URL
        $this->assertResponseStatus(302);
    }
```

可以在 `store` 方法中用 `$this->validate` 來做驗證：

```
$this->validate($request, [
    'title' => 'required|min:3',
    'body'  => 'required',
]);
```

也可以用 Form Request 。

* Form Request 可以被 reuse 。
* Form Request 可以寫入較複雜的邏輯。

新增 `ArticleRequest` ：

```
$ php artisan make:request ArticleRequest
```

編輯：

```php
namespace App\Http\Requests;

class ArticleRequest extends Request
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // 可以在這裡對身份做驗證，避免編輯到別人的資料
        // 暫時先回傳 true
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        // 新增驗證規則
        return [
            'title' => 'required|min:3',
            'body'  => 'required',
        ];
    }
}
```

用 `ArticleRequest` 取代 `Http\Request` ：

```php
// 記得修正 import
use App\Http\Requests\ArticleRequest;
use App\Repositories\ArticleRepository;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Redirect;

class ArticleController extends Controller {

    /**
     * Store a newly created resource in storage.
     *
     * @param ArticleRequest $request
     * @return Response
     */
    public function store(ArticleRequest $request)
    {
        // Request 改成 ArticleRequest
        // 以下的程式碼不變
        $this->repository->create($request->all());
        return Redirect::route('articles.index');
    }
```

## 加入認證

假設需要登入才可以發表文章，就要加入認證用的 middleware ：

* 直接在 Controller 的 contructor 中用 `$this->middleware('auth')` 來定義。
* 在 `routes.php` 上定義 `['middleware' => 'auth']` 。

```php
    public function __construct(ArticleRepository $repository)
    {
        // 除了列表頁外，其他 action 都加入驗證機制
        // 參考 App\Http\Kernel.php 裡的 $routeMiddleware
        $this->middleware('auth', ['except' => 'index']);

        $this->repository = $repository;
    }
```

再次執行測試會失敗，因為我們沒有認證成功。

Laravel 提供以下方式來模擬已經通過身份驗證：

```php
$this->be(new User(['email' => 'username@example.com']));
```

把它放在 `TestCase` 類別中方便呼叫：

```php
    protected function userLoggedIn()
    {
        $this->be(new User(['email' => 'username@example.com']));
    }
```

修正測試：

```php
    public function testCreateArticleSuccess()
    {
        // 把 Session::start 移到 setUp

        // 模擬使用者已登入
        $this->userLoggedIn();

        // 以下不變
        // ...
    }

    public function testCreateArticleFails()
    {
        // 把 Session::start 移到 setUp

        // 模擬使用者已登入
        $this->userLoggedIn();

        // 以下不變
        // ...
    }
```

如果使用者沒登入，可以用以下方法模擬：

```php
    public function testAuthFailed()
    {
        $this->call('POST', 'articles', [
            '_token' => csrf_token(),
        ]);
        $this->assertRedirectedTo('auth/login');
    }
```

## 登入與登出的測試



```php
use Illuminate\Support\Facades\Session;

class AuthControllerTest extends TestCase
{
    public function setUp()
    {
        parent::setUp();
        Session::start();
    }

    public function testLoginInvalidInput()
    {
        $this->call('POST', 'auth/login', [
            '_token' => csrf_token(),
        ]);

        $this->assertHasOldInput();
        $this->assertSessionHasErrors();
        $this->assertResponseStatus(302);
    }

    public function testLoginSuccess()
    {
        // Mock Auth Guard Object
        $guardMock = Mockery::mock('Illuminate\Auth\Guard');
        $this->app->instance('Illuminate\Contracts\Auth\Guard', $guardMock);

        /* @see App\Http\Middleware\RedirectIfAuthenticated */
        $guardMock
            ->shouldReceive('check')
            ->once()
            ->andReturn(false);

        /* @see Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers */
        $guardMock
            ->shouldReceive('attempt')
            ->once()
            ->andReturn(true);

        $this->call('POST', 'auth/login', [
            'email'    => 'jaceju@gmail.com',
            'password' => 'password',
            '_token'   => csrf_token(),
        ]);

        $this->assertRedirectedTo('home');
    }

    public function testLoginFailed()
    {
        // Mock Auth Guard Object
        $guardMock = Mockery::mock('Illuminate\Auth\Guard');
        $this->app->instance('Illuminate\Contracts\Auth\Guard', $guardMock);

        /* @see App\Http\Middleware\RedirectIfAuthenticated */
        $guardMock
            ->shouldReceive('check')
            ->once()
            ->andReturn(false);

        /* @see Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers */
        $guardMock
            ->shouldReceive('attempt')
            ->once()
            ->andReturn(false);

        $this->call('POST', 'auth/login', [
            'email'    => 'jaceju@gmail.com',
            'password' => 'password',
            '_token'   => csrf_token(),
        ]);

        $this->assertHasOldInput();
        $this->assertSessionHasErrors();
        $this->assertRedirectedTo('auth/login');
    }

    public function testLogout()
    {
        $this->userLoggedIn();

        // Mock Auth Guard Object
        $guardMock = Mockery::mock('Illuminate\Auth\Guard');
        $this->app->instance('Illuminate\Contracts\Auth\Guard', $guardMock);

        /* @see App\Http\Middleware\RedirectIfAuthenticated */
        $guardMock
            ->shouldReceive('logout')
            ->once();

        $this->call('GET', 'auth/logout');

        $this->assertRedirectedTo('/');
    }

    public function testRegister()
    {

    }

```

## 重構測試

```php
    protected function doesLoginPass($pass)
    {
        // Mock Auth Guard Object
        $guardMock = Mockery::mock('Illuminate\Auth\Guard');
        $this->app->instance('Illuminate\Contracts\Auth\Guard', $guardMock);

        /* @see App\Http\Middleware\RedirectIfAuthenticated */
        $guardMock
            ->shouldReceive('check')
            ->once()
            ->andReturn(false);

        /* @see Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers */
        $guardMock
            ->shouldReceive('attempt')
            ->once()
            ->andReturn($pass);

        $this->call('POST', 'auth/login', [
            'email'    => 'jaceju@gmail.com',
            'password' => 'password',
            '_token'   => csrf_token(),
        ]);

        if ($pass) {
            $this->assertRedirectedTo('home');
        } else {
            $this->assertHasOldInput();
            $this->assertSessionHasErrors();
            $this->assertRedirectedTo('auth/login');
        }
    }
}
```

## 心得

* 跨出把流程圖轉換成測試這步，再把它變成理所當然的開發步驟後，測試先行也沒那麼困難了。

* 不要想著要接上正式的資料來測試，你應該測試的是程式邏輯是否能正確轉換或存取預期或非預期的資料格式，而不是資料的正確性。

* 利用 Mock 把要測試的類別分離開來，讓測試的重點專注於類別的職責上。

* 測試時，利用 Interface + DI 來注入 Mock 物件。

## Reference

### Example

* http://www.neontsunami.com/articles/testing-laravel-with-phpunit

### CSRF

* http://marguspala.com/laravel-5-unit-testing-form-and-tokenmismatchexception-in-middleware/
* http://davejustdave.com/2015/02/08/laravel-5-unit-testing-with-csrf-protection/ (好解法)

### Controller

* http://www.lutro.me/articles/testable-simple-l4-code-without-repository-patterns
* https://medium.com/laravel-4/laravel-4-controller-testing-48414f4782d0
* http://culttt.com/2013/07/15/how-to-structure-testable-controllers-in-laravel-4/
* http://stackoverflow.com/questions/23374247/laravel-testing-with-phpunit-and-mockery-setting-up-dependencies-on-controller

### Email

* http://culttt.com/2014/04/14/sending-email-laravel-4/
* http://stackoverflow.com/questions/25767890/laravel-unit-test-how-to-test-event-with-email-without-send-an-email
* http://www.neontsunami.com/articles/testing-laravel-with-phpunit
