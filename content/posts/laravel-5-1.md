---
title: Laravel 5.1 正式釋出
date: 2015-06-10 00:34:37 +08:00
tags: ["Laravel", "PHP"]
---

經過了幾個月的等待， Laravel 5.1 終於在美國時間 6/9 [正式釋出](https://laravel-news.com/2015/06/laravel-5-1-released/)了。同時 Laracasts 也推出了一系列的 [Laravel 5.1 新功能介紹](https://laracasts.com/series/whats-new-in-laravel-5-1)，絕對是每位 Artisan 必看的影片。

官方也介紹了 5.1 有哪些[新特色](http://laravel.com/docs/5.1/releases) ，以下我會簡單介紹它們。

<!-- more -->

## 不再支援 PHP 5.5.9 以前的版本

從推出以來，我個人認為 Laravel 的作者似乎都一直在依循著 PHP 的新特色來開發 Laravel ，讓整個 Framework 不論在程式架構或效能上，都能保持在一定的水準。這次 5.1 版也是如此，直接就告訴大家：該把 PHP 升級到 5.5.9 以上的版本了，這樣才能使用新版的 Laravel 所帶來的好處。

很難想像這樣先進的 PHP Framework 的開發作者，原來是寫 .Net 的；而在開發 Laravel 之前完全沒學過 PHP ，真是令我汗顏。

## 第一個 LTS 版本

當然隨著 PHP 持續演進的過程中，勢必就得有所取捨；這樣的特色讓許多依賴舊的 Laravel 版本所開發的專案，在穩定與升級之間面臨很大的抉擇。到了 Laravel 5.1 ，作者終於正式宣佈它是一個 LTS (Long Term Support) 版本，將會讓企業安心用它來開發需要穩定的長期專案。

也就是說現在用 Laravel 5.1 開發的專案，在未來的兩、三年內可以不用再怕沒人修核心的 bug 了。

## 新的文件

在 5.1 將要發佈之前，作者花了很多心力在完善文件。例如 [Authentication](http://laravel.com/docs/5.1/authentication) 的部份就做了很完整的 Quickstart 範例，讓開發者瞭解如何去實作自己的認證機制。另外即時搜尋也是這次文件系統的新特色，讓開發者可以很快地用關鍵字來查閱相關說明。

不過我還是覺得字太小，而且每次要看其他章節都得捲回去頁首。

## PSR-2

在 Laravel 5.1 之前的版本，讓我最困擾的就是作者自己弄了一套 Coding Style ，而不是照著 PSR 標準走。終於在眾開發者的要求下，作者從善如流，讓核心代碼以及產生器所產生的程式碼，都遵守了 PSR-2 標準。

這個結果，我只能拍手叫好了；因為即便 PSR-2 再怎麼不如己意，但它終歸是大家討論出來的標準。 (公司的 coding style 也不正是如此嗎？)

* 相關影片： [Adopting PSR-2](https://laracasts.com/series/whats-new-in-laravel-5-1/episodes/1)

## 在樣版中注入服務

在 Blade 引擎中也新增了一個 `@inject` 指令，讓開發者可以即時地注入一個物件。

```html
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

這樣一來應該就可以不必在 Controller 或 View Composer 中引入變數了。

* 相關文件： [Blade Templates - Service Injection](http://laravel.com/docs/5.1/blade#service-injection)
* 相關影片： [Injecting Services With Blade](https://laracasts.com/series/whats-new-in-laravel-5-1/episodes/2)

## Middleware 參數

原本我們只能從傳入 request 物件給 middleware ，再從 request 物件中取得參數給 middleware 使用；在新版本終於可以自訂 middleware 的參數，再從 route 的定義裡傳入參數給 middleware 。

例如在製作權限系統時，就可以在 route 傳入指定的角色，讓管理權限的 middleware 判斷使用者是否符合這個角色。

```php
class RoleMiddleware
{
    public function handle($request, Closure $next, $role)
    {
        if (! $request->user()->hasRole($role)) {
            // Redirect...
        }

        return $next($request);
    }
}

Route::put('post/{id}', ['middleware' => 'role:editor', function ($id) {
    //
}]);
```

另外 Middleware 的設計也因為底層的 Symfony 採用了剛定案的 PSR-7 標準，所以也符合 PSR-7 的標準。

* 相關文件： [HTTP Middleware - Middleware Parameters](http://laravel.com/docs/5.1/middleware#middleware-parameters)

## 事件廣播

Laravel 原本已經包含了一個強大的事件系統，現在加上實作更簡單的事件廣播功能，能讓開發者搭配特定的服務 (例如 Redis) 以廣播 WebSocket 事件，便可以更有效率地做出即時應用程式。

原本我打算用 [ReactPHP](http://reactphp.org/) 的說，看來又要改變主意了。

* 相關文件： [Events - Broadcasting Events](http://laravel.com/docs/5.1/events#broadcasting-events)
* 相關影片： [The Power of Eventing](https://laracasts.com/series/intermediate-laravel/episodes/3) (需付費)

## 更完整的測試框架

先前的版本所提供的測試工具提供的功能有限，僅能做到部份的整合測試。現在 Laravel 5.1 引入了 laracasts 的測試套件，讓整合測試變得更易讀。

我才剛把 [Codeception](http://codeception.com/) 引入而已，這套要不要用可能要再研究一下。

* 相關文件： [Testing](http://laravel.com/docs/5.1/testing)

## 小結

據作者說， Laravel 5.1 是他目前最滿意的版本；當然這或許有些老王賣瓜的感覺，但從 Laravel 3 追到現在，我也覺得 Laravel 真的是與時俱進，不斷地結合許多先進的開發觀念。

接下來我會把一些目前正在執行的專案都換成 5.1 ，再來看看它是不是真的有如作者所說的這麼強大。