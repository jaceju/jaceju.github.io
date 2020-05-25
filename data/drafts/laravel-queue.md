# Laravel Queue 實務練習

## 設定 Laravel

用 Redis 來當做 Queue Driver

```bash
$ composer require predis/predis
```

`.env`

```ini
QUEUE_DRIVER=redis
DB_CONNECTION=sqlite
```

建立 Queue 資料表

```bash
$ php artisan queue:table
$ php artisan migrate
```

## 建立 Queue 服務

http://posts.danharper.me/laravel-queue-supervisor/